import { useState } from 'react';
import { ENDPOINTS, EndpointDefinition } from '../lib/endpoints';
import ApiRequestForm from './ApiRequestForm';

const METHOD_COLOR: Record<string, string> = { GET: 'var(--green)', POST: 'var(--accent2)', PUT: 'var(--amber)', DELETE: 'var(--red)' };

export default function ApiExplorer() {
  const [selected, setSelected] = useState<EndpointDefinition>(ENDPOINTS[0]);

  return (
    <div style={{ display: 'flex', gap: 24 }}>
      {/* Sidebar */}
      <div style={{ width: 220, flexShrink: 0 }}>
        <div style={{ color: 'var(--text3)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, padding: '0 4px' }}>
          Endpoints
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {ENDPOINTS.map(ep => (
            <button key={ep.slug} onClick={() => setSelected(ep)}
              className={`sidebar-link${selected.slug === ep.slug ? ' active' : ''}`}
              style={{ border: 'none', textAlign: 'left', width: '100%' }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 700, color: METHOD_COLOR[ep.method], minWidth: 34 }}>
                {ep.method}
              </span>
              <span style={{ fontSize: 13 }}>{ep.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 700, color: METHOD_COLOR[selected.method] }}>
            {selected.method}
          </span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: 'var(--text)' }}>{selected.path}</span>
        </div>
        <div style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 20 }}>{selected.description}</div>
        <ApiRequestForm endpoint={selected} />
      </div>
    </div>
  );
}
