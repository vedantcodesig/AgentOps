import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { API_BASE_URL } from '../lib/utils';

type AgentDef = { id: string; name: string; task: string; maxSteps: number; dependsOn: string[] };
type StepResult = { step: number; tool: string; input: string; output: string; latency_ms: number };
type AgentResult = { agentId: string; name: string; status: 'waiting' | 'running' | 'done' | 'error'; steps: StepResult[]; finalOutput: string; latency: number };

const DEFAULT_AGENTS: AgentDef[] = [
  { id: 'a1', name: 'Trajectory Ingest', task: 'Fetch device state for LSTM trajectory prediction', maxSteps: 2, dependsOn: [] },
  { id: 'a2', name: 'ZKP Auth', task: 'Verify IoT access control zero-knowledge proofs', maxSteps: 2, dependsOn: ['a1'] },
  { id: 'a3', name: 'Protocol Optimizer', task: 'Calculate handover latency for 5G network sharding', maxSteps: 1, dependsOn: ['a2'] },
];

export default function OrchestratorPage() {
  const [agents, setAgents] = useState<AgentDef[]>(DEFAULT_AGENTS);
  const [results, setResults] = useState<Record<string, AgentResult>>({});
  const [running, setRunning] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const updateAgent = (id: string, field: keyof AgentDef, value: any) => {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const addAgent = () => {
    const id = `a${Date.now()}`;
    setAgents(prev => [...prev, { id, name: 'New Node', task: 'Define a task', maxSteps: 2, dependsOn: [] }]);
    setEditingId(id);
  };

  const removeAgent = (id: string) => {
    setAgents(prev => prev.filter(a => a.id !== id).map(a => ({ ...a, dependsOn: a.dependsOn.filter(d => d !== id) })));
  };

  const runOrchestration = async () => {
    setRunning(true);
    setResults({});

    const init: Record<string, AgentResult> = {};
    agents.forEach(a => { init[a.id] = { agentId: a.id, name: a.name, status: 'waiting', steps: [], finalOutput: '', latency: 0 }; });
    setResults({ ...init });

    const runAgent = async (agent: AgentDef, prevOutputs: string[]) => {
      setResults(prev => ({ ...prev, [agent.id]: { ...prev[agent.id], status: 'running' } }));
      const t0 = Date.now();
      const contextTask = prevOutputs.length ? `${agent.task}. Context from previous nodes: ${prevOutputs.join(' | ')}` : agent.task;
      
      try {
        const res = await fetch(`${API_BASE_URL}/api/agent/run`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ task: contextTask, max_steps: agent.maxSteps }),
        });
        const data = await res.json();
        setResults(prev => ({ ...prev, [agent.id]: { ...prev[agent.id], status: 'done', steps: data.steps || [], finalOutput: data.final_output || '', latency: Date.now() - t0 } }));
        return data.final_output || '';
      } catch {
        setResults(prev => ({ ...prev, [agent.id]: { ...prev[agent.id], status: 'error' } }));
        return '';
      }
    };

    const completed = new Set<string>();
    const outputs: Record<string, string> = {};
    const order = [...agents];

    while (completed.size < agents.length) {
      const ready = order.filter(a => !completed.has(a.id) && a.dependsOn.every(d => completed.has(d)));
      if (ready.length === 0) break;
      await Promise.all(ready.map(async agent => {
        const prevOutputs = agent.dependsOn.map(d => outputs[d] || '').filter(Boolean);
        outputs[agent.id] = await runAgent(agent, prevOutputs);
        completed.add(agent.id);
      }));
    }
    setRunning(false);
  };

  const STATUS_COLOR: Record<string, string> = { waiting: 'var(--text3)', running: 'var(--accent2)', done: 'var(--green)', error: 'var(--red)' };

  // Calculate execution tiers for visual layout
  const getTier = (agentId: string, currentTier = 0): number => {
    const agent = agents.find(a => a.id === agentId);
    if (!agent || agent.dependsOn.length === 0) return currentTier;
    return Math.max(...agent.dependsOn.map(d => getTier(d, currentTier + 1)));
  };

  const tieredAgents = agents.reduce((acc, agent) => {
    const tier = getTier(agent.id);
    if (!acc[tier]) acc[tier] = [];
    acc[tier].push(agent);
    return acc;
  }, {} as Record<number, AgentDef[]>);

  return (
    <Layout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--text)', margin: 0 }}>Live Orchestrator Pipeline</h1>
          <p style={{ color: 'var(--text2)', fontSize: 13, margin: '4px 0 0' }}>Watch your multi-agent architecture process data in topological order.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-ghost" onClick={addAgent}>+ Add Node</button>
          <button className="btn-primary" onClick={runOrchestration} disabled={running}>
            {running ? 'Executing Pipeline...' : '▶ Run Pipeline'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 30, padding: 20, background: 'var(--bg2)', borderRadius: 12, border: '1px solid var(--border)', overflowX: 'auto' }}>
        {Object.keys(tieredAgents).sort().map((tierStr, index) => (
          <div key={tierStr} style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'relative' }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text3)', letterSpacing: 1 }}>Stage {index + 1}</div>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {tieredAgents[parseInt(tierStr)].map(agent => (
                <div key={agent.id} style={{ flex: '1 1 300px', maxWidth: 400, background: 'var(--bg)', borderRadius: 8, padding: 16, border: `2px solid ${STATUS_COLOR[results[agent.id]?.status || 'waiting']}`, transition: 'all 0.3s ease' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 15 }}>{agent.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>{agent.task}</div>
                    </div>
                    {results[agent.id]?.latency > 0 && (
                      <div style={{ fontSize: 11, color: 'var(--green)', fontFamily: 'JetBrains Mono, monospace', background: 'var(--bg3)', padding: '2px 6px', borderRadius: 4 }}>
                        {results[agent.id]?.latency}ms
                      </div>
                    )}
                  </div>

                  {results[agent.id]?.status === 'running' && (
                    <div style={{ fontSize: 12, color: 'var(--accent2)', fontStyle: 'italic' }}>Agent is reasoning...</div>
                  )}

                  {results[agent.id]?.finalOutput && (
                    <div style={{ background: 'var(--bg3)', borderRadius: 6, padding: '10px', fontSize: 12, color: 'var(--text)', fontFamily: 'JetBrains Mono, monospace', maxHeight: 100, overflowY: 'auto', border: '1px solid var(--border)' }}>
                      {results[agent.id].finalOutput}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 6, marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                    <button className="btn-ghost" onClick={() => removeAgent(agent.id)} style={{ padding: '4px 8px', fontSize: 11, color: 'var(--red)' }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
