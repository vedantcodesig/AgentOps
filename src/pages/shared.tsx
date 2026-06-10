import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';

export default function SharedPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const d = router.query.d as string;
    if (!d) return;
    try { setData(JSON.parse(atob(d))); } catch { setError('Invalid share link.'); }
  }, [router.query]);

  const METHOD_COLOR: Record<string, string> = { GET: 'var(--green)', POST: 'var(--accent2)', PUT: 'var(--amber)', DELETE: 'var(--red)' };

  return (
    <Layout>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'inline-block', background: 'var(--accent-glow)', border: '1px solid var(--accent)', borderRadius: 20, padding: '3px 12px', fontSize: 11, color: 'var(--accent2)', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 12, textTransform: 'uppercase' as const }}>Shared run</div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--text)', margin: 0 }}>Shared API run</h1>
          <p style={{ color: 'var(--text2)', fontSize: 13, margin: '4px 0 0' }}>Someone shared this request and response with you.</p>
        </div>

        {error && <div style={{ color: 'var(--red)' }}>{error}</div>}
        {!data && !error && <div style={{ color: 'var(--text3)' }}>Loading…</div>}
        {data && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 700, color: METHOD_COLOR[data.method] }}>{data.method}</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14, color: 'var(--text)' }}>{data.path}</span>
                <span style={{ color: data.latency < 300 ? 'var(--green)' : 'var(--amber)', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>{data.latency}ms</span>
              </div>
              <div style={{ color: 'var(--text3)', fontSize: 12 }}>Sent at {new Date(data.ts).toLocaleString()}</div>
            </div>

            {data.params && Object.keys(data.params).length > 0 && (
              <div className="card">
                <div className="label" style={{ marginBottom: 8 }}>Request params</div>
                <pre style={{ margin: 0, fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text)' }}>
                  {JSON.stringify(data.params, null, 2)}
                </pre>
              </div>
            )}

            <div className="card">
              <div className="label" style={{ marginBottom: 8 }}>Response</div>
              <pre style={{ margin: 0, fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text)', whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(data.response, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
