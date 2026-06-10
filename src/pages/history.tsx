import { useState, useEffect } from 'react';
import Layout from '../components/Layout';

type HistoryEntry = { id: number; endpoint: string; method: string; path: string; params: any; response: any; latency: number; ts: string };

export default function HistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [selected, setSelected] = useState<HistoryEntry | null>(null);
  const [filter, setFilter] = useState('');
  const [shareMsg, setShareMsg] = useState('');

  useEffect(() => {
    const hist = JSON.parse(localStorage.getItem('reqHistory') || '[]');
    setEntries(hist);
  }, []);

  const filtered = entries.filter(e => e.endpoint.includes(filter) || e.path.includes(filter));

  const shareEntry = (entry: HistoryEntry) => {
    const payload = btoa(JSON.stringify({ endpoint: entry.endpoint, path: entry.path, method: entry.method, params: entry.params, response: entry.response, latency: entry.latency, ts: entry.ts }));
    const url = `${window.location.origin}/shared?d=${payload}`;
    navigator.clipboard.writeText(url);
    setShareMsg(entry.id.toString());
    setTimeout(() => setShareMsg(''), 2000);
  };

  const clearHistory = () => { localStorage.removeItem('reqHistory'); setEntries([]); setSelected(null); };

  const METHOD_COLOR: Record<string, string> = { GET: 'var(--green)', POST: 'var(--accent2)', PUT: 'var(--amber)', DELETE: 'var(--red)' };

  return (
    <Layout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--text)', margin: 0 }}>Request History</h1>
          <p style={{ color: 'var(--text2)', fontSize: 13, margin: '4px 0 0' }}>Every request you send is saved. Share any run with a teammate via URL.</p>
        </div>
        <button className="btn-ghost" onClick={clearHistory}>Clear all</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20 }}>
        {/* List */}
        <div>
          <input className="input" value={filter} onChange={e => setFilter(e.target.value)} placeholder="Filter by endpoint…" style={{ marginBottom: 10 }} />
          {filtered.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text3)' }}>
              {entries.length === 0 ? 'No requests yet — send one from the Explorer.' : 'No results match your filter.'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {filtered.map(entry => (
                <div key={entry.id} onClick={() => setSelected(entry)}
                  style={{ background: selected?.id === entry.id ? 'var(--accent-glow)' : 'var(--bg2)', border: `1px solid ${selected?.id === entry.id ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 8, padding: '10px 14px', cursor: 'pointer', transition: 'border-color 0.15s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 700, color: METHOD_COLOR[entry.method] }}>{entry.method}</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text)' }}>{entry.path}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text3)', fontSize: 11 }}>{new Date(entry.ts).toLocaleTimeString()}</span>
                    <span style={{ color: entry.latency < 300 ? 'var(--green)' : 'var(--amber)', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>{entry.latency}ms</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail */}
        <div>
          {!selected ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text3)' }}>Select a request to inspect it</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="card" style={{ padding: '14px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 700, color: METHOD_COLOR[selected.method] }}>{selected.method}</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14, color: 'var(--text)' }}>{selected.path}</span>
                    <span style={{ color: selected.latency < 300 ? 'var(--green)' : 'var(--amber)', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>{selected.latency}ms</span>
                  </div>
                  <button className="btn-ghost" onClick={() => shareEntry(selected)} style={{ fontSize: 12, padding: '5px 14px' }}>
                    {shareMsg === selected.id.toString() ? '✓ Link copied!' : '⬡ Share run'}
                  </button>
                </div>
                <div style={{ color: 'var(--text3)', fontSize: 11, marginBottom: 10 }}>{new Date(selected.ts).toLocaleString()}</div>

                {Object.keys(selected.params).length > 0 && (
                  <div style={{ marginBottom: 14 }}>
                    <div className="label" style={{ marginBottom: 6 }}>Request params</div>
                    <pre style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 6, padding: 12, fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text)', margin: 0, overflowX: 'auto' }}>
                      {JSON.stringify(selected.params, null, 2)}
                    </pre>
                  </div>
                )}

                <div>
                  <div className="label" style={{ marginBottom: 6 }}>Response</div>
                  <pre style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 6, padding: 12, fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text)', margin: 0, overflowX: 'auto', maxHeight: 400, overflowY: 'auto' }}>
                    {JSON.stringify(selected.response, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
