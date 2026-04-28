import '../index.css';
import { Link } from 'react-router-dom';

const API = import.meta.env.VITE_API_BASE_URL;


const NAV_LINKS = ['Features', 'How it Works', 'Roles'];

const FEATURES = [
  {
    icon: '📤',
    bg: 'rgba(79,70,229,.1)',
    title: 'Content Upload',
    desc: 'Teachers upload PDFs, images, and documents with subject tagging. Files are instantly queued for principal review.',
  },
  {
    icon: '✅',
    bg: 'rgba(16,185,129,.1)',
    title: 'Principal Approval',
    desc: 'Principals get a dedicated review queue. Approve or reject content with a reason — all tracked and timestamped.',
  },
  {
    icon: '📡',
    bg: 'rgba(6,182,212,.1)',
    title: 'Live Broadcasting',
    desc: 'Approved content enters a stateless rotation per subject. Students always see the most relevant content in real time.',
  },
  {
    icon: '⏱️',
    bg: 'rgba(245,158,11,.1)',
    title: 'Smart Rotation',
    desc: 'Deterministic scheduling without a DB pointer. Each subject rotates independently with configurable durations.',
  },
  {
    icon: '🔒',
    bg: 'rgba(239,68,68,.1)',
    title: 'Role-Based Access',
    desc: 'Teachers, Principals, and Students each have strictly scoped API access enforced via JWT middleware.',
  },
  {
    icon: '🚦',
    bg: 'rgba(99,102,241,.1)',
    title: 'Rate Limiting',
    desc: 'Public broadcast endpoints are rate-limited to 60 req/min per IP — keeping the API fast and abuse-free.',
  },
];

const STEPS = [
  { n: '1', title: 'Teacher Uploads', desc: 'Upload content with subject, duration, and schedule window.' },
  { n: '2', title: 'Principal Reviews', desc: 'Content enters a pending queue for approval or rejection.' },
  { n: '3', title: 'Goes Live', desc: 'Approved content broadcasts immediately in the rotation cycle.' },
  { n: '4', title: 'Students Watch', desc: 'Access live content by teacher — no login required.' },
];

const ROLES = [
  {
    avatar: '👩‍🏫',
    bg: 'rgba(79,70,229,.1)',
    name: 'Teacher',
    tag: 'Content Creator',
    perms: [
      { icon: '📤', label: 'Upload content files' },
      { icon: '📋', label: 'View own upload history' },
      { icon: '🗑️', label: 'Delete own content' },
      { icon: '👁️', label: 'See rejection reasons' },
    ],
    iconBg: 'rgba(79,70,229,.12)',
    iconColor: '#4f46e5',
  },
  {
    avatar: '🧑‍💼',
    bg: 'rgba(16,185,129,.1)',
    name: 'Principal',
    tag: 'Content Approver',
    perms: [
      { icon: '✅', label: 'Approve or reject content' },
      { icon: '📊', label: 'View all uploads across teachers' },
      { icon: '👥', label: 'Manage teacher accounts' },
      { icon: '🔍', label: 'Filter by subject or teacher' },
    ],
    iconBg: 'rgba(16,185,129,.12)',
    iconColor: '#10b981',
  },
  {
    avatar: '🎒',
    bg: 'rgba(6,182,212,.1)',
    name: 'Student',
    tag: 'Viewer — No login needed',
    perms: [
      { icon: '📡', label: 'View live broadcast feed' },
      { icon: '🔎', label: 'Filter by subject' },
      { icon: '⏱️', label: 'See time remaining per item' },
      { icon: '🌐', label: 'Public API — no token required' },
    ],
    iconBg: 'rgba(6,182,212,.12)',
    iconColor: '#06b6d4',
  },
];

const DEMO_ITEMS = [
  { icon: '📐', bg: 'rgba(79,70,229,.1)', title: 'Pythagoras Theorem Practice', sub: 'Maths · Teacher Priya', time: '4:32', active: true },
  { icon: '🔬', bg: 'rgba(6,182,212,.1)', title: 'Photosynthesis Explained', sub: 'Science · Teacher Arjun', time: '–', active: false },
  { icon: '📖', bg: 'rgba(245,158,11,.1)', title: 'Chapter 6 Reading Quiz', sub: 'English · Teacher Riya', time: '–', active: false },
];

export default function Landing() {

  return (
    <>
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="nav-brand">
          <div className="nav-brand-icon">⚡</div>
          Syncro
        </div>
        <ul className="nav-links">
          {NAV_LINKS.map(l => (
            <li key={l}><a href={`#${l.toLowerCase().replace(/ /g, '-')}`}>{l}</a></li>
          ))}
          <li>
            <a href={`${API}/api-docs`} target="_blank" rel="noreferrer">API Docs ↗</a>
          </li>
        </ul>
        <div className="nav-cta">
          <Link className="btn btn-outline" to="/login">Sign in</Link>
          <Link className="btn btn-primary" to="/register">Get Started</Link>
        </div>

      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-badge">
          <span className="hero-badge-dot" />
          Live Broadcasting System
        </div>
        <h1>
          Content That Reaches<br />
          Every <span>Classroom</span>
        </h1>
        <p className="hero-subtitle">
          Syncro connects teachers, principals, and students through a real-time content approval and broadcasting pipeline — built for schools, powered by smart rotation.
        </p>
        <div className="hero-actions">
          <Link className="btn btn-primary btn-lg" to="/register">
            Get Started →
          </Link>
          <a className="btn btn-outline btn-lg" href="#how-it-works">
            See How It Works
          </a>
        </div>

        <div className="hero-stats">
          {[
            { n: '60/min', l: 'Rate Limited' },
            { n: '3 Roles', l: 'RBAC Enforced' },
            { n: 'Stateless', l: 'Rotation Algo' },
            { n: 'JWT', l: 'Auth Standard' },
          ].map(s => (
            <div key={s.l} className="stat-item">
              <div className="stat-number">{s.n}</div>
              <div className="stat-label">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* DEMO CARD */}
      <div className="demo-section">
        <div className="demo-card">
          <div className="demo-header">
            <span className="demo-dot" style={{ background: '#ef4444' }} />
            <span className="demo-dot" style={{ background: '#f59e0b' }} />
            <span className="demo-dot" style={{ background: '#10b981' }} />
            <code style={{ fontSize: '.78rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
              GET /api/broadcast/:teacherId
            </code>
            <span className="live-badge">
              <span className="live-dot" /> LIVE
            </span>
          </div>
          <div className="demo-content-items">
            {DEMO_ITEMS.map(item => (
              <div key={item.title} className={`demo-content-item${item.active ? ' active' : ''}`}>
                <div className="demo-item-icon" style={{ background: item.bg }}>{item.icon}</div>
                <div className="demo-item-info">
                  <div className="demo-item-title">{item.title}</div>
                  <div className="demo-item-sub">{item.sub}</div>
                </div>
                {item.active
                  ? <span className="demo-item-time">⏱ {item.time} left</span>
                  : <span style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>Up next</span>
                }
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <section className="section" id="features">
        <div className="section-header">
          <div className="section-tag">Features</div>
          <h2 className="section-title">Everything a school needs</h2>
          <p className="section-subtitle">From upload to live broadcast, every step is covered with security and scalability in mind.</p>
        </div>
        <div className="features-grid">
          {FEATURES.map(f => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon" style={{ background: f.bg }}>{f.icon}</div>
              <div className="feature-title">{f.title}</div>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section how-it-works" id="how-it-works">
        <div className="section-header">
          <div className="section-tag">How It Works</div>
          <h2 className="section-title">From upload to broadcast</h2>
          <p className="section-subtitle">A simple four-step pipeline that keeps content relevant, reviewed, and rotating.</p>
        </div>
        <div className="steps-grid">
          {STEPS.map(s => (
            <div key={s.n} className="step-card">
              <div className="step-number">{s.n}</div>
              <div className="step-title">{s.title}</div>
              <p className="step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ROLES */}
      <section className="section" id="roles">
        <div className="section-header">
          <div className="section-tag">Roles</div>
          <h2 className="section-title">Right access for everyone</h2>
          <p className="section-subtitle">Three distinct roles with strictly enforced JWT-based permissions.</p>
        </div>
        <div className="roles-grid">
          {ROLES.map(r => (
            <div key={r.name} className="role-card">
              <div className="role-header">
                <div className="role-avatar" style={{ background: r.bg }}>{r.avatar}</div>
                <div>
                  <div className="role-name">{r.name}</div>
                  <div className="role-tag">{r.tag}</div>
                </div>
              </div>
              <ul className="role-perms">
                {r.perms.map(p => (
                  <li key={p.label}>
                    <span className="perm-icon" style={{ background: r.iconBg, color: r.iconColor }}>{p.icon}</span>
                    {p.label}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-card">
          <h2>Ready to explore the API?</h2>
          <p>Dive into the full Swagger documentation and start testing all endpoints live.</p>
          <div className="cta-actions">
            <a className="btn btn-lg" href={`${API}/api-docs`} target="_blank" rel="noreferrer"
              style={{ background: 'white', color: 'var(--primary)', fontWeight: 700 }}>
              Open Swagger UI ↗
            </a>
            <a className="btn btn-lg btn-ghost" href="https://github.com/janavi-185/GrubPac" target="_blank" rel="noreferrer">
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <p>
          Built by <a href="https://github.com/janavi-185" target="_blank" rel="noreferrer">Janavi Chauhan</a> · 
          {' '}<a href={`${API}/api-docs`} target="_blank" rel="noreferrer">API Docs</a> · 
          {' '}<a href="https://github.com/janavi-185/GrubPac" target="_blank" rel="noreferrer">GitHub</a>
        </p>
      </footer>
    </>
  );
}
