import Link from 'next/link';
import { ENDPOINTS } from '../lib/endpoints';

const METHOD_COLOR: Record<string, string> = { GET: 'var(--green)', POST: 'var(--accent2)', PUT: 'var(--amber)', DELETE: 'var(--red)' };

export default function DocsSidebar({ activeSlug }: { activeSlug?: string }) {
  return (
    <aside style={{ width: 220, flexShrink: 0 }}>
      <div style={{ color: 'var(--text3)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, padding: '0 4px' }}>
        Endpoints
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {ENDPOINTS.map(ep => (
          <Link key={ep.slug} href={`/endpoint/${ep.slug}`}
            className={`sidebar-link${activeSlug === ep.slug ? ' active' : ''}`}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 700, color: METHOD_COLOR[ep.method] || 'var(--text2)', minWidth: 34 }}>
              {ep.method}
            </span>
            <span>{ep.name}</span>
          </Link>
        ))}
      </div>
    </aside>
  );
}
