import React, { useState, useEffect } from 'react';
import { Avatar, Dropdown, Badge, message } from 'antd';
import {
  DashboardOutlined, FileAddOutlined, FileTextOutlined,
  LogoutOutlined, UserOutlined, BellOutlined,
  MenuFoldOutlined, MenuUnfoldOutlined,
} from '@ant-design/icons';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BillingModule from './pages/BillingModule';
import Records from './pages/Records';
import ButterflyLogo from './components/ButterflyLogo';
import './App.css';

const NAV = [
  { key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: 'billing',   icon: <FileAddOutlined />,   label: 'Create Bill' },
  { key: 'records',   icon: <FileTextOutlined />,  label: 'Records' },
];

const PAGE_TITLES = {
  dashboard: 'Dashboard',
  billing:   'Create New Bill',
  records:   'Billing Records',
};

export default function App() {
  const [auth,      setAuth]      = useState(false);
  const [page,      setPage]      = useState('dashboard');
  const [user,      setUser]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Detect mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const u     = localStorage.getItem('user');
    if (token && u) { setAuth(true); setUser(JSON.parse(u)); }
    setLoading(false);
  }, []);

  const handleLogin = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setAuth(true); setUser(userData); setPage('dashboard');
    message.success('Welcome back! 👋');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuth(false); setUser(null); setPage('dashboard');
    message.info('Logged out successfully');
  };

  if (loading) return (
    <div className="app-loading">
      <div className="app-spinner" />
    </div>
  );

  if (!auth) return <Login onLogin={handleLogin} />;

  const sideW = isMobile ? 0 : (collapsed ? 72 : 240);

  const handleNavClick = (key) => {
    setPage(key);
    if (isMobile) setMobileOpen(false);
  };

  return (
    <div className="app-shell">

      {/* ── MOBILE OVERLAY ──────────────────────────────────── */}
      {isMobile && mobileOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── SIDEBAR ─────────────────────────────────────────── */}
      <aside
        className={`sidebar ${collapsed && !isMobile ? 'sidebar--collapsed' : ''} ${isMobile ? 'sidebar--mobile' : ''} ${isMobile && mobileOpen ? 'sidebar--mobile-open' : ''}`}
        style={{ width: isMobile ? 260 : sideW }}
      >

        {/* Brand */}
        <div className="sidebar-brand">
          <ButterflyLogo size={collapsed && !isMobile ? 32 : 38} />
          {(!collapsed || isMobile) && (
            <div className="sidebar-brand-text">
              <span className="sidebar-brand-name">Look @ me</span>
              <span className="sidebar-brand-sub">Billing System</span>
            </div>
          )}
          {isMobile && (
            <button
              onClick={() => setMobileOpen(false)}
              style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: 20, cursor: 'pointer', padding: '4px 8px' }}
            >✕</button>
          )}
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {NAV.map(item => (
            <button
              key={item.key}
              className={`nav-item ${page === item.key ? 'nav-item--active' : ''}`}
              onClick={() => handleNavClick(item.key)}
              title={collapsed && !isMobile ? item.label : ''}
            >
              <span className="nav-icon">{item.icon}</span>
              {(!collapsed || isMobile) && <span className="nav-label">{item.label}</span>}
              {page === item.key && <span className="nav-active-bar" />}
            </button>
          ))}
        </nav>

        {/* Collapse toggle — desktop only */}
        {!isMobile && (
          <button className="sidebar-toggle" onClick={() => setCollapsed(c => !c)}>
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </button>
        )}
      </aside>

      {/* ── MAIN AREA ────────────────────────────────────────── */}
      <div className="main-area" style={{ marginLeft: isMobile ? 0 : sideW }}>

        {/* Top bar */}
        <header className="topbar">
          <div className="topbar-left">
            {/* Hamburger — mobile only */}
            {isMobile && (
              <button
                onClick={() => setMobileOpen(true)}
                style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--text)', padding: '4px', display: 'flex', alignItems: 'center', flexShrink: 0 }}
              >
                ☰
              </button>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
              <h1 className="topbar-title">{PAGE_TITLES[page]}</h1>
              <p className="topbar-date">
                {new Date().toLocaleDateString('en-IN', {
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                })}
              </p>
            </div>
          </div>

          <div className="topbar-right">
            <button className="topbar-icon-btn">
              <BellOutlined style={{ fontSize: 18 }} />
            </button>

            <Dropdown
              menu={{ items: [{ key: 'logout', icon: <LogoutOutlined />, label: 'Logout', danger: true, onClick: handleLogout }] }}
              placement="bottomRight"
              arrow
            >
              <div className="topbar-user">
                <Avatar
                  size={36}
                  style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', fontWeight: 700, flexShrink: 0 }}
                  icon={<UserOutlined />}
                />
                <div className="topbar-user-info">
                  <span className="topbar-user-name">{user?.username}</span>
                  <span className="topbar-user-role">Administrator</span>
                </div>
              </div>
            </Dropdown>
          </div>
        </header>

        {/* Page content */}
        <main className="page-content">
          {page === 'dashboard' && <Dashboard />}
          {page === 'billing'   && <BillingModule />}
          {page === 'records'   && <Records />}
        </main>

        {/* ── MOBILE BOTTOM NAV ─────────────────────────────── */}
        {isMobile && (
          <nav className="mobile-bottom-nav">
            {NAV.map(item => (
              <button
                key={item.key}
                className={`mobile-nav-btn ${page === item.key ? 'mobile-nav-btn--active' : ''}`}
                onClick={() => setPage(item.key)}
              >
                <span className="mobile-nav-icon">{item.icon}</span>
                <span className="mobile-nav-label">{item.label}</span>
              </button>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}
