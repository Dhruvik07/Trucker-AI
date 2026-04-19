import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, Send, Truck, LogOut, ShieldCheck, Users, FileText, Building2, Car, Menu } from 'lucide-react';
import './index.css';

import { AuthProvider, useAuth } from './auth/AuthContext';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import SmartDispatch from './pages/SmartDispatch';
import DriverAppView from './pages/DriverAppView';
import DriversPage from './pages/DriversPage';
import VehiclesPage from './pages/VehiclesPage';
import DocumentsPage from './pages/DocumentsPage';
import TerminalsPage from './pages/TerminalsPage';


// ─── Navigation config ────────────────────────────────────────────────────────
const MANAGER_NAV = [
  { path: '/',             label: 'Fleet Map & Alerts', icon: <LayoutDashboard size={18} /> },
  { path: '/dispatch',     label: 'AI Dispatch',        icon: <Send size={18} /> },
  { path: '/drivers',      label: 'Drivers',            icon: <Users size={18} /> },
  { path: '/vehicles',     label: 'Vehicles',           icon: <Car size={18} /> },
  { path: '/documents',    label: 'Documents',          icon: <FileText size={18} /> },
  { path: '/terminals',    label: 'Terminals',          icon: <Building2 size={18} /> },
];

const DRIVER_NAV = [
  { path: '/driver-portal', label: 'Driver Portal', icon: <Truck size={18} /> },
];

// ─── Sidebar nav ──────────────────────────────────────────────────────────────
const NavLinks = ({ isSidebarOpen }) => {
  const location = useLocation();
  const { user } = useAuth();
  const navItems = user?.role === 'manager' ? MANAGER_NAV : DRIVER_NAV;

  return (
    <nav style={{ padding: '0.75rem 0.5rem', flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
      {/* Group label */}
      {user?.role === 'manager' && isSidebarOpen && (
        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 1rem', marginBottom: '0.5rem', whiteSpace: 'nowrap' }}>Operations</div>
      )}
      {navItems.slice(0, user?.role === 'manager' ? 2 : 1).map(item => (
        <NavItem key={item.path} item={item} active={location.pathname === item.path} isSidebarOpen={isSidebarOpen} />
      ))}

      {user?.role === 'manager' && (
        <>
          {isSidebarOpen && <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 1rem', margin: '1rem 0 0.5rem', whiteSpace: 'nowrap' }}>Management</div>}
          {navItems.slice(2).map(item => (
            <NavItem key={item.path} item={item} active={location.pathname === item.path} isSidebarOpen={isSidebarOpen} />
          ))}
        </>
      )}
    </nav>
  );
};

const NavItem = ({ item, active, isSidebarOpen }) => (
  <Link
    to={item.path}
    title={!isSidebarOpen ? item.label : undefined}
    style={{
      display: 'flex', alignItems: 'center', gap: '0.65rem',
      padding: isSidebarOpen ? '0.65rem 1rem' : '0.65rem 0',
      justifyContent: isSidebarOpen ? 'flex-start' : 'center',
      marginBottom: '0.2rem',
      color: active ? 'var(--primary)' : '#64748b',
      background: active ? 'rgba(59,130,246,0.08)' : 'transparent',
      border: `1px solid ${active ? 'rgba(59,130,246,0.18)' : 'transparent'}`,
      borderRadius: 'var(--radius-md)',
      textDecoration: 'none', fontWeight: 500, fontSize: '0.88rem',
      transition: 'all 0.15s ease',
      whiteSpace: 'nowrap',
    }}
    onMouseEnter={e => { if (!active) { e.currentTarget.style.color = '#0f172a'; e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; } }}
    onMouseLeave={e => { if (!active) { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = 'transparent'; } }}
  >
    {item.icon}
    {isSidebarOpen && <span>{item.label}</span>}
  </Link>
);

// ─── Protected Route ──────────────────────────────────────────────────────────
function ProtectedRoute({ children, requiredRole }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && user.role !== requiredRole)
    return <Navigate to={user.role === 'driver' ? '/driver-portal' : '/'} replace />;
  return children;
}

// ─── Page title map ───────────────────────────────────────────────────────────
const TITLES = {
  '/':              'Fleet Map & Alerts',
  '/dispatch':      'AI Dispatch',
  '/trip/create':   'Create Trip',
  '/drivers':       'Drivers',
  '/vehicles':      'Vehicles',
  '/documents':     'Documents',
  '/terminals':     'Terminals',
  '/driver-portal': 'Driver Portal',
};

// ─── App shell ────────────────────────────────────────────────────────────────
function AppContent() {
  const { user, logout, navproToken } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  if (!user) {
    return <Routes><Route path="*" element={<LoginPage />} /></Routes>;
  }

  const title = TITLES[location.pathname] || 'Dashboard';
  const isManager = user.role === 'manager';

  return (
    <div className="app-container text-main">
      {/* ─── Sidebar ─── */}
      <aside className="sidebar" style={{ width: isSidebarOpen ? '240px' : '70px', minWidth: isSidebarOpen ? '240px' : '70px', transition: 'all 0.3s ease', overflow: 'hidden' }}>
        <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center', justifyContent: isSidebarOpen ? 'space-between' : 'center', padding: isSidebarOpen ? '1.25rem 1.5rem' : '1.25rem 0' }}>
          {isSidebarOpen && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width:34, height:34, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, background:'linear-gradient(135deg,#3b82f6,#8b5cf6)', color:'white', borderRadius:'8px', fontSize:'0.95rem' }}>T</div>
              <h2 style={{ whiteSpace: 'nowrap' }}>Trucker AI</h2>
            </div>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.2rem' }}
            title="Toggle Sidebar"
          >
            <Menu size={20} color="#0f172a" />
          </button>
        </div>

        <NavLinks isSidebarOpen={isSidebarOpen} />

        {/* NavPro token indicator */}
        <div style={{ padding: isSidebarOpen ? '0.5rem 1rem' : '0.5rem', margin: '0 0.5rem 0.5rem', display: 'flex', justifyContent: 'center' }}>
          {isSidebarOpen ? (
            <div style={{ padding: '0.5rem 0.75rem', borderRadius: '0.5rem', background: navproToken ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.08)', border: `1px solid ${navproToken ? 'rgba(16,185,129,0.25)' : 'rgba(245,158,11,0.25)'}`, fontSize: '0.7rem', color: navproToken ? '#059669' : '#d97706', display:'flex', alignItems:'center', gap:5 }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background: navproToken ? '#10b981' : '#f59e0b', flexShrink:0 }}/>
              <span style={{ whiteSpace: 'nowrap' }}>{navproToken ? 'NavPro API Connected' : 'No API Token (demo mode)'}</span>
            </div>
          ) : (
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: navproToken ? '#10b981' : '#f59e0b' }} title={navproToken ? 'NavPro API Connected' : 'No API Token (demo mode)'} />
          )}
        </div>

        {/* User card + logout */}
        <div style={{ padding: isSidebarOpen ? '0 0.5rem 0.75rem' : '0 0 0.75rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {isSidebarOpen ? (
            <div style={{ display:'flex', alignItems:'center', gap:'0.6rem', padding:'0.6rem 0.75rem', marginBottom:'0.35rem', width: '100%' }}>
              <div style={{ width:34, height:34, borderRadius:'50%', background: isManager ? 'linear-gradient(135deg,#3b82f6,#6d28d9)' : 'linear-gradient(135deg,#10b981,#059669)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.65rem', fontWeight:700, color:'white', flexShrink:0, letterSpacing:'0.02em' }}>
                {user.avatar}
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'0.1rem', overflow:'hidden' }}>
                <span style={{ fontSize:'0.8rem', fontWeight:600, color:'#0f172a', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user.name}</span>
                <span style={{ fontSize:'0.68rem', display:'flex', alignItems:'center', gap:'0.25rem', color: isManager ? '#3b82f6' : '#10b981' }}>
                  {isManager ? <ShieldCheck size={10}/> : <Truck size={10}/>}
                  {isManager ? 'Manager' : `Driver · ${user.truckId}`}
                </span>
              </div>
            </div>
          ) : (
            <div title={user.name} style={{ width:34, height:34, borderRadius:'50%', background: isManager ? 'linear-gradient(135deg,#3b82f6,#6d28d9)' : 'linear-gradient(135deg,#10b981,#059669)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.65rem', fontWeight:700, color:'white', flexShrink:0, letterSpacing:'0.02em', marginBottom: '0.5rem' }}>
              {user.avatar}
            </div>
          )}
          
          <button onClick={logout} title="Sign Out" style={{ width: isSidebarOpen ? '100%' : '40px', height: isSidebarOpen ? 'auto' : '40px', display:'flex', alignItems:'center', justifyContent: 'center', gap:'0.5rem', padding: isSidebarOpen ? '0.5rem 0.75rem' : '0', borderRadius:'0.5rem', background:'transparent', border:'1px solid rgba(239,68,68,0.25)', color:'#f87171', cursor:'pointer', fontSize:'0.8rem', fontWeight:500, fontFamily:'inherit', transition:'background 0.2s' }}
            onMouseEnter={e=>e.currentTarget.style.background='rgba(239,68,68,0.08)'}
            onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
            <LogOut size={15}/> {isSidebarOpen && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      {/* ─── Main ─── */}
      <main className="main-content">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.75rem' }}>
          <div>
            <h1 style={{ fontSize:'1.75rem', margin:0 }}>{title}</h1>
            <p style={{ marginTop:'0.2rem', color:'#64748b', margin: 0 }}>Real-time sync active.</p>
          </div>
          <span className="badge badge-success" style={{ display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ width:7, height:7, borderRadius:'50%', background:'var(--success)', display:'inline-block' }}/>
            System Online
          </span>
        </div>

        <div style={{ flex:1, overflowY:'auto' }}>
          <Routes>
            {/* Manager routes */}
            <Route path="/" element={<ProtectedRoute requiredRole="manager"><Dashboard /></ProtectedRoute>} />
            <Route path="/dispatch" element={<ProtectedRoute requiredRole="manager"><SmartDispatch /></ProtectedRoute>} />

            <Route path="/drivers" element={<ProtectedRoute requiredRole="manager"><DriversPage /></ProtectedRoute>} />
            <Route path="/vehicles" element={<ProtectedRoute requiredRole="manager"><VehiclesPage /></ProtectedRoute>} />
            <Route path="/documents" element={<ProtectedRoute requiredRole="manager"><DocumentsPage /></ProtectedRoute>} />
            <Route path="/terminals" element={<ProtectedRoute requiredRole="manager"><TerminalsPage /></ProtectedRoute>} />
            {/* Driver route */}
            <Route path="/driver-portal" element={<ProtectedRoute requiredRole="driver"><DriverAppView /></ProtectedRoute>} />
            {/* Catch-all */}
            <Route path="*" element={<Navigate to={isManager ? '/' : '/driver-portal'} replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
