import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { API_BASE_URL } from '../lib/utils';

type GoldenRun = { id: string; name: string; endpoint: string; params: Record<string, any>; expectedKeys: string[]; goldenResponse: any; lastResult?: 'pass' | 'fail' | 'pending'; lastRan?: string; drift?: string[] };

const PRESETS: GoldenRun[] = [
  { id: 'g1', name: 'Hello greeting check', endpoint: '/api/hello', params: {}, expectedKeys: ['message'], goldenResponse: { message: 'Hello, world!' }, lastResult: 'pending' },
  { id: 'g2', name: 'Echo returns message', endpoint: '/api/echo', params: { message: 'test' }, expectedKeys: ['echo'], goldenResponse: { echo: 'test' }, lastResult: 'pending' },
  { id: 'g3', name: 'Agent run structure', endpoint: '/api/agent/run', params: { task: 'regression test', max_steps: 2 }, expectedKeys: ['task', 'steps', 'final_output'], goldenResponse: null, lastResult: 'pending' },
];

export default function RegressionPage() {
  const [runs, setRuns] = useState<GoldenRun[]>(PRESETS);
  const [testing, setTesting] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newRun, setNewRun] = useState({ name: '', endpoint: '/api/hello', params: '{}', expectedKeys: 'message' });

  useEffect(() => {
    const saved = localStorage.getItem('goldenRuns');
    if (saved) setRuns(JSON.parse(saved));
    else { setRuns(PRESETS); localStorage.setItem('goldenRuns', JSON.stringify(PRESETS)); }
  }, []);

  const save = (updated: GoldenRun[]) => { setRuns(updated); localStorage.setItem('goldenRuns', JSON.stringify(updated)); };

  const runTest = async (run: GoldenRun) => {
    setTesting(run.id);
    try {
      const method = run.params && Object.keys(run.params).length > 0 ? 'POST' : 'GET';
      const res = await fetch(`${API_BASE_URL}${run.endpoint}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: method === 'POST' ? JSON.stringify(run.params) : undefined,
      });
      const data = await res.json();
      const drift = run.expectedKeys.filter(k => !(k in data));
      const goldenDrift = run.goldenResponse
        ? Object.keys(run.goldenResponse).filter(k => JSON.stringify(data[k]) !== JSON.stringify(run.goldenResponse[k]))
        : [];
      const allDrift = [...new Set([...drift, ...goldenDrift])];
      const updated = runs.map(r => r.id === run.id ? { ...r, lastResult: allDrift.length === 0 ? 'pass' : 'fail', lastRan: new Date().toISOString(), drift: allDrift } as GoldenRun : r);
      save(updated);
    } catch {
      const updated = runs.map(r => r.id === run.id ? { ...r, lastResult: 'fail' as const, lastRan: new Date().toISOString(), drift: ['request failed'] } : r);
      save(updated);
    }
    setTesting(null);
  };

  const runAll = async () => { for (const run of runs) await runTest(run); };

  const addRun = () => {
    try {
      const r: GoldenRun = { id: `g${Date.now()}`, name: newRun.name, endpoint: newRun.endpoint, params: JSON.parse(newRun.params), expectedKeys: newRun.expectedKeys.split(',').map(s => s.trim()), goldenResponse: null, lastResult: 'pending' };
      save([...runs, r]);
      setShowAdd(false);
      setNewRun({ name: '', endpoint: '/api/hello', params: '{}', expectedKeys: '' });
    } catch { alert('Invalid JSON in params'); }
  };

  const deleteRun = (id: string) => save(runs.filter(r => r.id !== id));

  const STATUS: Record<string, { color: string; icon: string; label: string }> = {
    pass: { color: 'var(--green)', icon: '✓', label: 'Pass' },
    fail: { color: 'var(--red)', icon: '✕', label: 'Fail' },
    pending: { color: 'var(--text3)', icon: '○', label: 'Not run' },
  };

  const passCount = runs.filter(r => r.lastResult === 'pass').length;
  const failCount = runs.filter(r => r.lastResult === 'fail').length;

  return (
    <Layout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--text)', margin: 0 }}>Regression Testing</h1>
          <p style={{ color: 'var(--text2)', fontSize: 13, margin: '4px 0 0' }}>Save golden runs. Re-run them to catch when agent outputs drift.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-ghost" onClick={() => setShowAdd(true)}>+ New test</button>
          <button className="btn-primary" onClick={runAll} disabled={!!testing}>
            {testing ? 'Testing…' : '▶ Run all'}
          </button>
        </div>
      </div>

      {/* Summary bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total', value: runs.length, color: 'var(--text2)' },
          { label: 'Passing', value: passCount, color: 'var(--green)' },
          { label: 'Failing', value: failCount, color: failCount > 0 ? 'var(--red)' : 'var(--text3)' },
        ].map(s => (
          <div key={s.label} className="card-sm" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ fontSize: 20, fontWeight: 600, color: s.color, fontFamily: 'JetBrains Mono, monospace' }}>{s.value}</span>
            <span style={{ color: 'var(--text2)', fontSize: 12 }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Add new test */}
      {showAdd && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 600, marginBottom: 14, color: 'var(--text)' }}>New regression test</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div><label className="label">Test name</label><input className="input" value={newRun.name} onChange={e => setNewRun(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Hello returns greeting" /></div>
            <div><label className="label">Endpoint path</label><input className="input" value={newRun.endpoint} onChange={e => setNewRun(p => ({ ...p, endpoint: e.target.value }))} placeholder="/api/hello" /></div>
            <div><label className="label">Params (JSON)</label><input className="input mono" value={newRun.params} onChange={e => setNewRun(p => ({ ...p, params: e.target.value }))} placeholder='{"message": "test"}' /></div>
            <div><label className="label">Expected keys (comma-separated)</label><input className="input" value={newRun.expectedKeys} onChange={e => setNewRun(p => ({ ...p, expectedKeys: e.target.value }))} placeholder="echo, status" /></div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-primary" onClick={addRun}>Save test</button>
            <button className="btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Test list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {runs.map(run => {
          const s = STATUS[run.lastResult || 'pending'];
          return (
            <div key={run.id} className="card" style={{ padding: '14px 18px', borderColor: run.lastResult === 'fail' ? 'rgba(239,68,68,0.3)' : run.lastResult === 'pass' ? 'rgba(34,211,165,0.2)' : 'var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ color: s.color, fontSize: 14, fontWeight: 700 }}>{s.icon}</span>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 14, color: 'var(--text)' }}>{run.name}</div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 3 }}>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--accent2)' }}>{run.endpoint}</span>
                      {run.lastRan && <span style={{ color: 'var(--text3)', fontSize: 11 }}>ran {new Date(run.lastRan).toLocaleTimeString()}</span>}
                    </div>
                    {run.drift && run.drift.length > 0 && (
                      <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {run.drift.map(d => (
                          <span key={d} style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--red)', fontSize: 11, padding: '2px 8px', borderRadius: 4, fontFamily: 'JetBrains Mono, monospace' }}>
                            drift: {d}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn-ghost" onClick={() => runTest(run)} disabled={testing === run.id} style={{ padding: '5px 14px', fontSize: 12 }}>
                    {testing === run.id ? '…' : 'Run'}
                  </button>
                  <button onClick={() => deleteRun(run.id)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 16, padding: '5px 8px' }}>×</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Layout>
  );
}
