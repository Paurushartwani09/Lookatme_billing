import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Avatar, Dropdown, Badge, message, Modal } from 'antd';
import {
  DashboardOutlined, FileAddOutlined, FileTextOutlined,
  LogoutOutlined, UserOutlined, BellOutlined,
  MenuFoldOutlined, MenuUnfoldOutlined, SettingOutlined,
  ClockCircleOutlined, ExclamationCircleOutlined,
} from '@ant-design/icons';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BillingModule from './pages/BillingModule';
import Records from './pages/Records';
import Settings from './pages/Settings';
import ButterflyLogo from './components/ButterflyLogo';
import './App.css';

const SESSION_TIMEOUT   = 30 * 60 * 1000; // 30 minutes
const WARNING_BEFORE    =  5 * 60 * 1000; // warn at 25 min (5 min before logout)
const WARNING_AT        = SESSION_TIMEOUT - WARNING_BEFORE;

const NAV = [
  { key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: 'billing',   icon: <FileAddOutlined />,   label: 'Create Bill' },
  { key: 'records',   icon: <FileTextOutlined />,  label: 'Records' },
  { key: 'settings',  icon: <SettingOutlined />,   label: 'Settings' },
];

const PAGE_TITLES = {
  dashboard: 'Dashboard',
  billing:   'Create New Bill',
  records:   'Billing Records',
  settings:  'Account Settings',
};

export default function App() {
  const [auth,        setAuth]        = useState(false);
  const [page,        setPage]        = useState('dashboard');
  const [user,        setUser]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [collapsed,   setCollapsed]   = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [countdown,   setCountdown]   = useState(300); // seconds left in warning
  const [sessionMsg,  setSessionMsg]  = useState('');  // message shown on login after timeout

  const warningTimer  = useRef(null);
  const logoutTimer   = useRef(null);
  const countdownRef  = useRef(null);

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

  // ── Session timeout logic ────────────────────────────────
  const clearAllTimers = useCallback(() => {
    clearTimeout(warningTimer.current);
    clearTimeout(logoutTimer.current);
    clearInterval(countdownRef.current);
  }, []);

  const doLogout = useCallback((reason = '') => {
    clearAllTimers();
    setShowWarning(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuth(false);
    setUser(null);
    setPage('dashboard');
    setSessionMsg(reason);
  }, [clearAllTimers]);

  const startTimers = useCallback(() => {
    clearAllTimers();
    setShowWarning(false);

    // Show warning at 25 min
    warningTimer.current = setTimeout(() => {
      setShowWarning(true);
      setCountdown(300); // 5 min = 300 sec
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, WARNING_AT);

    // Auto logout at 30 min
    logoutTimer.current = setTimeout(() => {
      doLogout('Your session expired after 30 minutes of inactivity.');
    }, SESSION_TIMEOUT);
  }, [clearAllTimers, doLogout]);

  const resetTimers = useCallback(() => {
    if (!auth) return;
    startTimers();
  }, [auth, startTimers]);

  // Start timers when logged in
  useEffect(() => {
    if (auth) {
      startTimers();
    } else {
      clearAllTimers();
    }
    return () => clearAllTimers();
  }, [auth, startTimers, clearAllTimers]);

  // Reset on any user activity
  useEffect(() => {
    if (!auth) return;
    const events = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll', 'click'];
    events.forEach(e => window.addEventListener(e, resetTimers, { passive: true }));
    return () => events.forEach(e => window.removeEventListener(e, resetTimers));
  }, [auth, resetTimers]);

  const handleStayLoggedIn = () => {
    setShowWarning(false);
    clearInterval(countdownRef.current);
    startTimers();
  };

  // ── Auth handlers ────────────────────────────────────────
  const handleLogin = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setAuth(true); setUser(userData); setPage('dashboard');
    setSessionMsg('');
    message.success('Welcome back! 👋');
  };

  const handleLogout = () => {
    doLogout('');
    message.info('Logged out successfully');
  };

  const handleUserUpdate = (updatedUser, newToken) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    if (newToken) localStorage.setItem('token', newToken);
  };

  if (loading) return (
    <div className="app-loading">
      <div className="app-spinner" />
    </div>
  );

  if (!auth) return <Login onLogin={handleLogin} sessionMsg={sessionMsg} />;

  const sideW = isMobile ? 0 : (collapsed ? 72 : 240);

  const handleNavClick = (key) => {
    setPage(key);
    if (isMobile) setMobileOpen(false);
  };

  return (
    <>
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
              menu={{ items: [
                { key: 'settings', icon: <SettingOutlined />, label: 'Account Settings', onClick: () => setPage('settings') },
                { type: 'divider' },
                { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', danger: true, onClick: handleLogout },
              ]}}
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
          {page === 'settings'  && <Settings user={user} onUserUpdate={handleUserUpdate} />}
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

      {/* ── Session Timeout Warning Modal ───────────────────── */}
      <Modal
        open={showWarning}
        closable={false}
        maskClosable={false}
        footer={null}
        centered
        width={400}
      >
        <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(245,158,11,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 30 }}>
            <ClockCircleOutlined style={{ color: '#f59e0b' }} />
          </div>
          <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 800, color: 'var(--text)', fontFamily: 'Raleway, sans-serif' }}>
            Session Expiring Soon
          </h3>
          <p style={{ margin: '0 0 6px', fontSize: 14, color: 'var(--muted)', fontFamily: 'Raleway, sans-serif' }}>
            You've been inactive. You'll be logged out in:
          </p>
          <div style={{ fontSize: 42, fontWeight: 900, color: countdown <= 60 ? '#ef4444' : '#f59e0b', fontFamily: 'monospace', margin: '12px 0 20px', letterSpacing: 2 }}>
            {String(Math.floor(countdown / 60)).padStart(2, '0')}:{String(countdown % 60).padStart(2, '0')}
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => doLogout('')}
              style={{ flex: 1, padding: '11px 0', borderRadius: 10, border: '2px solid var(--border)', background: '#fff', color: 'var(--muted)', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Raleway, sans-serif' }}
            >
              Logout Now
            </button>
            <button
              onClick={handleStayLoggedIn}
              style={{ flex: 1, padding: '11px 0', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#667eea,#764ba2)', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Raleway, sans-serif', boxShadow: '0 4px 14px rgba(108,99,255,.35)' }}
            >
              Stay Logged In
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
