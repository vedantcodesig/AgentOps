import { useState } from 'react';

export default function ResponseViewer({ response, prevResponse }: { response: any; prevResponse?: any }) {
  const [mode, setMode] = useState<'pretty' | 'raw' | 'diff'>('pretty');
  if (!response) return null;

  const json = JSON.stringify(response, null, 2);
  const prevJson = prevResponse ? JSON.stringify(prevResponse, null, 2) : null;

  const renderDiff = () => {
    if (!prevJson) return <div style={{ color: 'var(--text3)', fontSize: 12 }}>No previous response to diff against.</div>;
    const newLines = json.split('\n');
    const oldLines = prevJson.split('\n');
    return newLines.map((line, i) => {
      const old = oldLines[i];
      const changed = old !== line;
      return (
        <div key={i} className={changed ? 'diff-add' : ''} style={{ padding: '1px 8px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>
          {line}
        </div>
      );
    });
  };

  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ color: 'var(--text2)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Response</span>
        <div style={{ display: 'flex', gap: 4 }}>
          {(['pretty', 'raw', 'diff'] as const).map(m => (
            <button key={m} className={`tab${mode === m ? ' active' : ''}`} onClick={() => setMode(m)}>
              {m}
            </button>
          ))}
        </div>
      </div>
      <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'auto', maxHeight: 360 }}>
        {mode === 'diff' ? (
          <div style={{ padding: '12px 0' }}>{renderDiff()}</div>
        ) : (
          <pre style={{ margin: 0, padding: 16, fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text)', whiteSpace: 'pre-wrap' }}>
            {mode === 'pretty' ? json : JSON.stringify(response)}
          </pre>
        )}
      </div>
    </div>
  );
}
