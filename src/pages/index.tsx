import Link from 'next/link';
import Layout from '../components/Layout';

const FEATURES = [
  {
    icon: '⚡',
    title: 'API Explorer',
    desc: 'Send requests, inspect responses, and copy auto-generated code in TypeScript or Python.',
    href: '/api-explorer',
    color: 'var(--accent)',
  },
  {
    icon: '◈',
    title: 'Multi-Agent Orchestrator',
    desc: 'Chain agents together visually. Watch tasks flow between agents step by step in real time.',
    href: '/orchestrator',
    color: 'var(--green)',
  },
  {
    icon: '◎',
    title: 'Regression Testing',
    desc: 'Save golden runs and re-run them to catch when your agent outputs drift after a code change.',
    href: '/regression',
    color: 'var(--amber)',
  },
  {
    icon: '◷',
    title: 'Request History',
    desc: 'Every request you send is saved. Share a run with a teammate via a unique URL.',
    href: '/history',
    color: '#c084fc',
  },
];

export default function Home() {
  return (
    <Layout>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <div style={{ marginBottom: 48, paddingTop: 16 }}>
          <div style={{
            display: 'inline-block',
            background: 'var(--accent-glow)',
            border: '1px solid var(--accent)',
            borderRadius: 20,
            padding: '3px 12px',
            fontSize: 11,
            color: 'var(--accent2)',
            fontWeight: 600,
            letterSpacing: '0.08em',
            marginBottom: 20,
            textTransform: 'uppercase',
          }}>Developer Console</div>
          <h1 style={{ fontSize: 42, fontWeight: 600, lineHeight: 1.2, color: 'var(--text)', margin: '0 0 16px' }}>
            Build and debug<br />
            <span style={{ color: 'var(--accent2)' }}>AI agent workflows</span>
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: 16, lineHeight: 1.7, maxWidth: 520, margin: '0 0 28px' }}>
            A local dev console for testing APIs, orchestrating multi-agent chains,
            and catching regressions before they reach production.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link href="/api-explorer" className="btn-primary" style={{ textDecoration: 'none', padding: '10px 22px', fontSize: 14 }}>
              Open Explorer
            </Link>
            <Link href="/orchestrator" className="btn-ghost" style={{ textDecoration: 'none', padding: '10px 22px', fontSize: 14 }}>
              Try Orchestrator
            </Link>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {FEATURES.map(f => (
            <Link key={f.href} href={f.href} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ cursor: 'pointer', transition: 'border-color 0.2s', height: '100%' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = f.color)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
                <div style={{ fontSize: 22, marginBottom: 10 }}>{f.icon}</div>
                <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text)', marginBottom: 6 }}>{f.title}</div>
                <div style={{ color: 'var(--text2)', fontSize: 13, lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            </Link>
          ))}
        </div>

        <div className="card" style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="glow-dot" />
            <span style={{ color: 'var(--text2)', fontSize: 13 }}>Backend running at</span>
            <span className="mono" style={{ color: 'var(--green)', fontSize: 12 }}>{process.env.NEXT_PUBLIC_API_BASE_URL || "https://agentops-ulx1gg.fly.dev"}</span>
          </div>
          <a href={} target="_blank" rel="noreferrer"
            style={{ color: 'var(--text3)', fontSize: 12, textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text3)')}>
            Swagger docs →
          </a>
        </div>
      </div>
    </Layout>
  );
}
