import React, { useState } from 'react';
import axios from 'axios';
import { message } from 'antd';
import { UserOutlined, LockOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import ButterflyLogo from '../components/ButterflyLogo';

const API_URL = 'http://localhost:5000/api';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { username, password });
      const { token, admin } = response.data;
      onLogin(token, admin);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Login failed. Please try again.';
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated background blobs */}
      <div style={{
        position: 'absolute', width: 600, height: 600,
        background: 'radial-gradient(circle, rgba(108,99,255,0.15) 0%, transparent 70%)',
        top: -200, right: -200, borderRadius: '50%',
        animation: 'pulse 4s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(255,107,107,0.1) 0%, transparent 70%)',
        bottom: -100, left: -100, borderRadius: '50%',
        animation: 'pulse 6s ease-in-out infinite reverse',
      }} />

      <div className="login-layout">
        {/* Left Panel - Branding */}
        <div className="login-brand-panel">
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <ButterflyLogo size={90} shadow />
          </div>
          <h1 className="login-brand-title">Look @ me</h1>
          <p className="login-brand-sub">Professional Billing System</p>

          <div className="login-features">
            {[
              { icon: '📄', text: 'Generate professional PDF invoices instantly' },
              { icon: '📊', text: 'Track daily revenue and sales analytics' },
              { icon: '🛒', text: 'Manage products and billing with ease' },
            ].map((item, i) => (
              <div key={i} className="login-feature-item">
                <div className="login-feature-icon">{item.icon}</div>
                <span className="login-feature-text">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="login-form-panel">
          <div className="login-card">
            <div style={{ marginBottom: 32 }}>
              <h2 className="login-card-title">Welcome back 👋</h2>
              <p className="login-card-sub">Sign in to your billing dashboard</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Username */}
              <div>
                <label className="login-label">Username</label>
                <div style={{ position: 'relative' }}>
                  <UserOutlined style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 16 }} />
                  <input
                    type="text" value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    required disabled={loading}
                    className="login-input"
                    onFocus={e => { e.target.style.borderColor='#6c63ff'; e.target.style.background='white'; e.target.style.boxShadow='0 0 0 4px rgba(108,99,255,0.1)'; }}
                    onBlur={e => { e.target.style.borderColor='#e5e7eb'; e.target.style.background='#f9fafb'; e.target.style.boxShadow='none'; }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="login-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <LockOutlined style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 16 }} />
                  <input
                    type={showPassword ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required disabled={loading}
                    className="login-input"
                    style={{ paddingRight: 44 }}
                    onFocus={e => { e.target.style.borderColor='#6c63ff'; e.target.style.background='white'; e.target.style.boxShadow='0 0 0 4px rgba(108,99,255,0.1)'; }}
                    onBlur={e => { e.target.style.borderColor='#e5e7eb'; e.target.style.background='#f9fafb'; e.target.style.boxShadow='none'; }}
                  />
                  <div onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#9ca3af', fontSize: 16 }}>
                    {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                  </div>
                </div>
              </div>

              {error && (
                <div style={{ background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: 10, padding: '12px 16px', color: '#e53e3e', fontSize: 14, fontWeight: 500 }}>
                  ⚠️ {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="login-submit-btn"
                onMouseEnter={e => { if (!loading) { e.target.style.transform='translateY(-2px)'; e.target.style.boxShadow='0 8px 24px rgba(108,99,255,0.45)'; } }}
                onMouseLeave={e => { e.target.style.transform='translateY(0)'; e.target.style.boxShadow='0 4px 16px rgba(108,99,255,0.35)'; }}>
                {loading ? '⏳ Signing in...' : '🚀 Sign In'}
              </button>
            </form>

            {/* <div className="login-demo-box">
              <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 700, color: '#6c63ff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Demo Credentials
              </p>
              <p style={{ margin: 0, fontSize: 14, color: '#374151' }}>
                Username: <strong style={{ color: '#6c63ff' }}>admin</strong>
                &nbsp;&nbsp;|&nbsp;&nbsp;
                Password: <strong style={{ color: '#6c63ff' }}>admin123</strong>
              </p>
            </div> */}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}

export default Login;
