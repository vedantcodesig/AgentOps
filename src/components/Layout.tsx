import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';

const NAV = [
  { href: '/', label: 'Home', icon: '⬡' },
  { href: '/api-explorer', label: 'Explorer', icon: '⚡' },
  { href: '/orchestrator', label: 'Orchestrator', icon: '◈' },
  { href: '/regression', label: 'Regression', icon: '◎' },
  { href: '/history', label: 'History', icon: '◷' },
];

export default function Layout({ children }: { children: ReactNode }) {
  const router = useRouter();
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <header style={{
        background: 'var(--bg2)',
        borderBottom: '1px solid var(--border)',
        padding: '0 24px',
        height: '52px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{
            width: 28, height: 28,
            background: 'var(--accent)',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, color: '#fff', fontWeight: 700,
            boxShadow: '0 0 12px var(--accent-glow)',
          }}>A</div>
          <span style={{ color: 'var(--text)', fontWeight: 600, fontSize: 15 }}>AgentOps</span>
          <span style={{ color: 'var(--text3)', fontSize: 12 }}>Studio</span>
        </Link>
        <nav style={{ display: 'flex', gap: 4 }}>
          {NAV.map(n => (
            <Link key={n.href} href={n.href}
              className={`sidebar-link${router.pathname === n.href ? ' active' : ''}`}
              style={{ padding: '5px 12px', fontSize: 13 }}>
              <span style={{ fontSize: 11 }}>{n.icon}</span>
              {n.label}
            </Link>
          ))}
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="glow-dot" />
          <span style={{ color: 'var(--text3)', fontSize: 12 }}>backend live</span>
        </div>
      </header>
      <main style={{ flex: 1, maxWidth: 1200, width: '100%', margin: '0 auto', padding: '28px 24px' }}>
        {children}
      </main>
      <footer style={{ borderTop: '1px solid var(--border)', padding: '14px 24px', textAlign: 'center', color: 'var(--text3)', fontSize: 12 }}>
        AgentOps Studio — {new Date().getFullYear()}
      </footer>
    </div>
  );
}
