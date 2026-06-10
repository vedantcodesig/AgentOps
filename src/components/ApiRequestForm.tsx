import dynamic from "next/dynamic";
const TerminalViewer = dynamic(() => import("./TerminalViewer"), { ssr: false });
import { useState, useEffect } from 'react';
import type { EndpointDefinition } from '../lib/endpoints';
import CodeSnippet from './CodeSnippet';
import ResponseViewer from './ResponseViewer';
import { generateTypeScriptSnippet, generatePythonSnippet, generateCurlSnippet, generateGoSnippet, API_BASE_URL, interpolateVars } from '../lib/utils';

export default function ApiRequestForm({ endpoint }: { endpoint: EndpointDefinition }) {
  const [params, setParams] = useState<Record<string, any>>({});
  const [token, setToken] = useState('');
  const [envVars, setEnvVars] = useState<Record<string, string>>({});
  const [response, setResponse] = useState<any>(null);
  const [prevResponse, setPrevResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [latency, setLatency] = useState<number | null>(null);
  const [tokenSaved, setTokenSaved] = useState(false);
  const [lang, setLang] = useState<'ts' | 'py' | 'curl' | 'go'>('ts');

  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    if (savedToken) setToken(savedToken);
    
    // Load environment variables for interpolation
    const savedEnv = localStorage.getItem('agentEnvVars');
    if (savedEnv) setEnvVars(JSON.parse(savedEnv));
  }, []);

  const handleParamChange = (name: string, value: string) => {
    setParams(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPrevResponse(response);
    setLoading(true);
    setError(null);
    setResponse(null);
    
    // Interpolate parameters just before sending
    const interpolatedParams: Record<string, any> = {};
    for (const [key, val] of Object.entries(params)) {
      interpolatedParams[key] = typeof val === 'string' ? interpolateVars(val, envVars) : val;
    }
    
    const t0 = Date.now();
    try {
      const url = `${API_BASE_URL}${endpoint.path}`;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${interpolateVars(token, envVars)}`;
      
      const options: RequestInit = { method: endpoint.method, headers };
      if (endpoint.method !== 'GET') options.body = JSON.stringify(interpolatedParams);
      
      const res = await fetch(url, options);
      const data = await res.json();
      setLatency(Date.now() - t0);
      
      if (!res.ok) setError((data && data.detail) || res.statusText);
      else {
        setResponse(data);
        const entry = { id: Date.now(), endpoint: endpoint.slug, method: endpoint.method, path: endpoint.path, params: interpolatedParams, response: data, latency: Date.now() - t0, ts: new Date().toISOString() };
        const hist = JSON.parse(localStorage.getItem('reqHistory') || '[]');
        localStorage.setItem('reqHistory', JSON.stringify([entry, ...hist].slice(0, 100)));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToken = () => {
    localStorage.setItem('authToken', token);
    setTokenSaved(true);
    setTimeout(() => setTokenSaved(false), 2000);
  };

  const url = `${API_BASE_URL}${endpoint.path}`;
  
  // Snippets
  const snippets = {
    ts: generateTypeScriptSnippet(endpoint, params, token || undefined),
    py: generatePythonSnippet(endpoint, params, token || undefined),
    curl: generateCurlSnippet(endpoint, params, token || undefined),
    go: generateGoSnippet(endpoint, params, token || undefined)
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      {/* Left Column: Form */}
      <div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {endpoint.params?.map(param => (
            <div key={param.name}>
              <label className="label">{param.name}{param.required ? ' *' : ''}</label>
              <input className="input" type={param.type === 'number' ? 'number' : 'text'} required={param.required} placeholder={param.description}
                onChange={e => handleParamChange(param.name, param.type === 'number' ? Number(e.target.value) : e.target.value)} />
            </div>
          ))}
          <div>
            <label className="label">Auth token</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="input" type="text" value={token} placeholder="Bearer token (supports {{VAR}})"
                onChange={e => setToken(e.target.value)} />
              <button type="button" className="btn-ghost" onClick={handleSaveToken} style={{ whiteSpace: 'nowrap', padding: '8px 14px' }}>
                {tokenSaved ? '✓' : 'Save'}
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
            <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1 }}>
              {loading ? 'Sending...' : 'Send request'}
            </button>
            {latency !== null && !loading && (
              <span style={{ color: latency < 300 ? 'var(--green)' : latency < 800 ? 'var(--amber)' : 'var(--red)', fontSize: 13, fontFamily: 'JetBrains Mono, monospace', padding: '8px 12px', background: 'var(--bg3)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                ⏱ {latency}ms
              </span>
            )}
          </div>
        </form>
        {error && (
          <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: 'var(--red)', fontSize: 13, lineHeight: 1.5 }}>
            <strong>Error:</strong> {error}
          </div>
        )}
        <div style={{ marginTop: 20 }}>
            <ResponseViewer response={response} prevResponse={prevResponse} />
        {endpoint.slug === "agent-run" && <TerminalViewer />}
        </div>
      </div>

      {/* Right Column: Dynamic Code Gen */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <label className="label" style={{ margin: 0 }}>Auto-generated Code</label>
            <div style={{ display: 'flex', gap: 4, background: 'var(--bg3)', padding: 4, borderRadius: 6, border: '1px solid var(--border)' }}>
                {(['ts', 'py', 'curl', 'go'] as const).map(l => (
                    <button key={l} type="button" onClick={() => setLang(l)} style={{ background: lang === l ? 'var(--accent)' : 'transparent', color: lang === l ? '#fff' : 'var(--text2)', border: 'none', padding: '4px 10px', fontSize: 11, borderRadius: 4, cursor: 'pointer', fontWeight: 600 }}>
                        {l.toUpperCase()}
                    </button>
                ))}
            </div>
        </div>
        <CodeSnippet code={snippets[lang]} language={lang} url={url} method={endpoint.method} body={params} token={token || undefined} />
      </div>
    </div>
  );
}
