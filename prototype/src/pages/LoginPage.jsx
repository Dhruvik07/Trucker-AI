import React, { useState } from 'react';
import { Truck, Eye, EyeOff, LogIn, ShieldCheck, Key, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { USERS } from '../auth/jwt';

const DEMO_CREDENTIALS = [
  { label: 'Manager', username: 'manager', password: 'fleet2024', role: 'manager' },
  ...USERS.filter((u) => u.role === 'driver').map((u) => ({
    label: u.name, username: u.username, password: u.password, role: 'driver',
  })),
];

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [navproToken, setNavproToken] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [showTokenSection, setShowTokenSection] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const result = login(username.trim(), password, navproToken.trim());
    setLoading(false);
    if (!result.success) setError(result.error);
  };

  const quickFill = (u, p) => { setUsername(u); setPassword(p); setError(''); };

  return (
    <div style={S.page}>
      <div style={S.blob1} />
      <div style={S.blob2} />

      <div style={S.card}>
        <div style={S.logoRow}>
          <div style={S.logoIcon}><Truck size={26} color="white" /></div>
          <span style={S.logoText}>Trucker<span style={S.logoAccent}> AI</span></span>
        </div>

        <h1 style={S.heading}>Welcome back</h1>
        <p style={S.sub}>Sign in to your fleet operations dashboard</p>

        <div style={S.roleStrip}>
          <div style={{ ...S.roleBadge, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', color: '#2563eb' }}>
            <ShieldCheck size={12} /> Manager
          </div>
          <div style={{ ...S.roleBadge, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#059669' }}>
            <Truck size={12} /> Driver
          </div>
          <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>Role assigned automatically</span>
        </div>

        <form onSubmit={handleSubmit} style={S.form}>
          <div style={S.field}>
            <label style={S.label}>Username</label>
            <input id="login-username" type="text" value={username}
              onChange={(e) => setUsername(e.target.value)} placeholder="Enter username"
              required autoComplete="username" style={S.input}
              onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(0,0,0,0.12)')} />
          </div>

          <div style={S.field}>
            <label style={S.label}>Password</label>
            <div style={S.pwWrap}>
              <input id="login-password" type={showPw ? 'text' : 'password'} value={password}
                onChange={(e) => setPassword(e.target.value)} placeholder="Enter password"
                required autoComplete="current-password"
                style={{ ...S.input, paddingRight: '2.75rem' }}
                onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(0,0,0,0.12)')} />
              <button type="button" onClick={() => setShowPw(!showPw)} style={S.eyeBtn} tabIndex={-1}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* NavPro Token Collapsible */}
          <div style={S.tokenSection}>
            <button type="button" onClick={() => setShowTokenSection(!showTokenSection)} style={S.tokenToggle}>
              <Key size={14} />
              <span>NavPro API Token</span>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', flex: 1, textAlign: 'left' }}>(optional — enables live data)</span>
              {showTokenSection ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {showTokenSection && (
              <div style={{ marginTop: '0.6rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={S.pwWrap}>
                  <input id="navpro-token" type={showToken ? 'text' : 'password'} value={navproToken}
                    onChange={(e) => setNavproToken(e.target.value)}
                    placeholder="Bearer token from NavPro platform"
                    style={{ ...S.input, paddingRight: '2.75rem', fontSize: '0.8rem', fontFamily: 'monospace' }}
                    onFocus={(e) => (e.target.style.borderColor = '#8b5cf6')}
                    onBlur={(e) => (e.target.style.borderColor = 'rgba(0,0,0,0.12)')} />
                  <button type="button" onClick={() => setShowToken(!showToken)} style={S.eyeBtn} tabIndex={-1}>
                    {showToken ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <a href="https://navpro.qa-websit.truckerpath.com/setting/api-docs" target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: '0.72rem', color: '#6d28d9', display: 'flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none' }}>
                  <ExternalLink size={11} /> Get your token from NavPro platform
                </a>
              </div>
            )}
          </div>

          {error && <div style={S.errorBox}>{error}</div>}

          <button id="login-submit" type="submit" style={S.submitBtn} disabled={loading}>
            {loading ? <span style={S.spinner} /> : <><LogIn size={17} /> Sign In</>}
          </button>
        </form>

        <div style={S.demoSection}>
          <p style={S.demoLabel}>Demo credentials — click to fill</p>
          <div style={S.demoGrid}>
            {DEMO_CREDENTIALS.map((c) => (
              <button key={c.username} onClick={() => quickFill(c.username, c.password)}
                style={{
                  ...S.demoChip,
                  borderColor: c.role === 'manager' ? 'rgba(59,130,246,0.3)' : 'rgba(16,185,129,0.3)',
                  background: c.role === 'manager' ? 'rgba(59,130,246,0.06)' : 'rgba(16,185,129,0.06)',
                }}>
                <span style={{ fontWeight: 600, fontSize: '0.75rem', color: c.role === 'manager' ? '#2563eb' : '#059669' }}>{c.label}</span>
                <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{c.username}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const S = {
  page: { minHeight: '100vh', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', background: '#f1f5f9' },
  blob1: { position: 'absolute', top: '-15%', left: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)', animation: 'blobFloat 8s ease-in-out infinite alternate', pointerEvents: 'none' },
  blob2: { position: 'absolute', bottom: '-15%', right: '-10%', width: '450px', height: '450px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', animation: 'blobFloat 10s ease-in-out infinite alternate-reverse', pointerEvents: 'none' },
  card: { position: 'relative', zIndex: 1, width: '100%', maxWidth: '460px', background: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '1.25rem', padding: '2.25rem', boxShadow: '0 8px 40px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.06)' },
  logoRow: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' },
  logoIcon: { width: 46, height: 46, borderRadius: '12px', background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(59,130,246,0.3)' },
  logoText: { fontSize: '1.45rem', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.03em' },
  logoAccent: { color: '#6d28d9' },
  heading: { fontSize: '1.55rem', fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '-0.03em' },
  sub: { color: '#64748b', fontSize: '0.88rem', marginTop: '0.3rem', marginBottom: '1.25rem' },
  roleStrip: { display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' },
  roleBadge: { display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.2rem 0.55rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600 },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.35rem' },
  label: { fontSize: '0.8rem', fontWeight: 500, color: '#475569' },
  input: { width: '100%', padding: '0.65rem 1rem', background: '#f8fafc', border: '1px solid rgba(0,0,0,0.12)', borderRadius: '0.6rem', color: '#0f172a', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s', fontFamily: 'inherit' },
  pwWrap: { position: 'relative' },
  eyeBtn: { position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, display: 'flex', alignItems: 'center' },
  tokenSection: { borderTop: '1px solid rgba(0,0,0,0.07)', paddingTop: '0.75rem' },
  tokenToggle: { display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '0.82rem', fontWeight: 500, width: '100%', padding: '0.25rem 0', fontFamily: 'inherit' },
  errorBox: { padding: '0.6rem 1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '0.6rem', color: '#dc2626', fontSize: '0.83rem' },
  submitBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.8rem 1.25rem', marginTop: '0.15rem', background: 'linear-gradient(135deg, #3b82f6 0%, #6d28d9 100%)', color: 'white', border: 'none', borderRadius: '0.7rem', fontSize: '0.93rem', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 16px rgba(59,130,246,0.3)', fontFamily: 'inherit' },
  spinner: { width: 18, height: 18, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' },
  demoSection: { marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(0,0,0,0.07)' },
  demoLabel: { color: '#94a3b8', fontSize: '0.72rem', marginBottom: '0.65rem', textAlign: 'center' },
  demoGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.35rem' },
  demoChip: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.12rem', padding: '0.4rem', borderRadius: '0.5rem', border: '1px solid', cursor: 'pointer', background: 'transparent', fontFamily: 'inherit' },
};
