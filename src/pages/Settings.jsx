import React, { useState } from 'react';
import axios from 'axios';
import { message, Spin } from 'antd';
import { UserOutlined, LockOutlined, EyeOutlined, EyeInvisibleOutlined, SettingOutlined, CheckCircleOutlined } from '@ant-design/icons';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ── Defined OUTSIDE Settings to prevent focus loss on re-render ──────────────

function F({ label, err, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label className='field-label' style={{ color: err ? '#ef4444' : undefined }}>
        {label}
        {err && <span style={{ color: '#ef4444', fontSize: 11, fontWeight: 500, marginLeft: 8 }}>{err}</span>}
      </label>
      {children}
    </div>
  );
}

function PasswordInput({ value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div className='field-wrap'>
      <span className='field-icon'><LockOutlined /></span>
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className='field-input'
        style={{ paddingRight: 40 }}
        autoComplete='new-password'
      />
      <button
        type='button'
        onClick={() => setShow(s => !s)}
        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 16, padding: 0, display: 'flex', alignItems: 'center' }}
      >
        {show ? <EyeInvisibleOutlined /> : <EyeOutlined />}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function Settings({ user, onUserUpdate }) {
  // ── Username change state ────────────────────────────────
  const [newUsername, setNewUsername] = useState('');
  const [currentPwdU, setCurrentPwdU] = useState('');
  const [usernameErr, setUsernameErr] = useState({});
  const [savingUser,  setSavingUser]  = useState(false);
  const [userDone,    setUserDone]    = useState(false);

  // ── Password change state ────────────────────────────────
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd,     setNewPwd]     = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdErr,     setPwdErr]     = useState({});
  const [savingPwd,  setSavingPwd]  = useState(false);
  const [pwdDone,    setPwdDone]    = useState(false);

  // ── Validate username form ───────────────────────────────
  const validateUsername = () => {
    const e = {};
    if (!newUsername.trim()) e.newUsername = 'New username is required';
    else if (newUsername.trim().length < 3) e.newUsername = 'Username must be at least 3 characters';
    else if (!/^[a-zA-Z0-9_]+$/.test(newUsername.trim())) e.newUsername = 'Only letters, numbers and underscore allowed';
    if (!currentPwdU.trim()) e.currentPwdU = 'Current password is required to confirm';
    setUsernameErr(e);
    return Object.keys(e).length === 0;
  };

  // ── Validate password form ───────────────────────────────
  const validatePassword = () => {
    const e = {};
    if (!currentPwd.trim()) e.currentPwd = 'Current password is required';
    if (!newPwd.trim()) e.newPwd = 'New password is required';
    else if (newPwd.length < 6) e.newPwd = 'Password must be at least 6 characters';
    if (!confirmPwd.trim()) e.confirmPwd = 'Please confirm your new password';
    else if (newPwd !== confirmPwd) e.confirmPwd = 'Passwords do not match';
    setPwdErr(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit username change ───────────────────────────────
  const handleUsernameChange = async () => {
    if (!validateUsername()) return;
    setSavingUser(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`${API_URL}/auth/change-username`, {
        new_username: newUsername.trim(),
        current_password: currentPwdU,
      }, { headers: { Authorization: `Bearer ${token}` } });

      const updatedUser = { ...user, username: newUsername.trim() };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      localStorage.setItem('token', res.data.token);
      onUserUpdate(updatedUser, res.data.token);

      setNewUsername('');
      setCurrentPwdU('');
      setUsernameErr({});
      setUserDone(true);
      setTimeout(() => setUserDone(false), 4000);
      message.success('Username updated successfully!');
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to update username';
      if (msg.toLowerCase().includes('password')) {
        setUsernameErr({ currentPwdU: 'Incorrect password' });
      } else if (msg.toLowerCase().includes('taken') || msg.toLowerCase().includes('exists')) {
        setUsernameErr({ newUsername: 'Username already taken' });
      } else {
        message.error(msg);
      }
    } finally {
      setSavingUser(false);
    }
  };

  // ── Submit password change ───────────────────────────────
  const handlePasswordChange = async () => {
    if (!validatePassword()) return;
    setSavingPwd(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/auth/change-password`, {
        current_password: currentPwd,
        new_password: newPwd,
      }, { headers: { Authorization: `Bearer ${token}` } });

      setCurrentPwd('');
      setNewPwd('');
      setConfirmPwd('');
      setPwdErr({});
      setPwdDone(true);
      setTimeout(() => setPwdDone(false), 4000);
      message.success('Password updated successfully!');
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to update password';
      if (msg.toLowerCase().includes('incorrect') || msg.toLowerCase().includes('wrong') || msg.toLowerCase().includes('invalid')) {
        setPwdErr({ currentPwd: 'Incorrect current password' });
      } else {
        message.error(msg);
      }
    } finally {
      setSavingPwd(false);
    }
  };

  // ── Password strength ────────────────────────────────────
  const getStrength = (pwd) => {
    if (!pwd) return 0;
    if (pwd.length >= 12 && /[A-Z]/.test(pwd) && /\d/.test(pwd) && /[^a-zA-Z0-9]/.test(pwd)) return 4;
    if (pwd.length >= 8 && (/[A-Z]/.test(pwd) || /\d/.test(pwd))) return 3;
    if (pwd.length >= 6) return 2;
    return 1;
  };
  const strengthColors = ['#ef4444', '#f59e0b', '#4d96ff', '#52c97a'];
  const strengthLabels = ['Too short', 'Weak', 'Good', 'Strong'];
  const strength = getStrength(newPwd);

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', width: '100%' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
        <div className='icon-badge' style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', width: 48, height: 48, borderRadius: 14, fontSize: 22 }}>
          <SettingOutlined />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text)', fontFamily: 'Raleway, sans-serif' }}>Account Settings</h2>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)' }}>Manage your login credentials</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>

        {/* ── Change Username Card ─────────────────────────── */}
        <div className='card'>
          <div className='card-header'>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className='icon-badge' style={{ background: 'linear-gradient(135deg,#4d96ff,#1e90ff)', width: 38, height: 38, borderRadius: 11, fontSize: 17 }}>
                <UserOutlined />
              </div>
              <div>
                <div className='card-title'>Change Username</div>
                <div className='card-sub'>Current: <strong>{user?.username}</strong></div>
              </div>
            </div>
          </div>
          <div className='card-body'>
            <F label='New Username' err={usernameErr.newUsername}>
              <div className='field-wrap'>
                <span className='field-icon'><UserOutlined /></span>
                <input
                  type='text'
                  value={newUsername}
                  onChange={e => { setNewUsername(e.target.value); if (usernameErr.newUsername) setUsernameErr(prev => ({ ...prev, newUsername: '' })); }}
                  placeholder='Enter new username'
                  className='field-input'
                  style={{ borderColor: usernameErr.newUsername ? '#ef4444' : undefined }}
                  autoComplete='off'
                />
              </div>
            </F>
            <F label='Current Password (to confirm)' err={usernameErr.currentPwdU}>
              <PasswordInput
                value={currentPwdU}
                onChange={e => { setCurrentPwdU(e.target.value); if (usernameErr.currentPwdU) setUsernameErr(prev => ({ ...prev, currentPwdU: '' })); }}
                placeholder='Enter current password'
              />
            </F>
            <button
              onClick={handleUsernameChange}
              disabled={savingUser}
              style={{
                width: '100%', padding: '12px 0', borderRadius: 12, border: 'none',
                background: userDone ? 'linear-gradient(135deg,#56ab2f,#a8e063)' : 'linear-gradient(135deg,#4d96ff,#1e90ff)',
                color: '#fff', fontWeight: 700, fontSize: 14, cursor: savingUser ? 'not-allowed' : 'pointer',
                fontFamily: 'Raleway, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: savingUser ? 0.7 : 1, transition: 'all .3s', boxShadow: '0 4px 14px rgba(77,150,255,.35)',
              }}
            >
              {savingUser ? <Spin size='small' /> : userDone ? <><CheckCircleOutlined /> Username Updated!</> : 'Update Username'}
            </button>
          </div>
        </div>

        {/* ── Change Password Card ─────────────────────────── */}
        <div className='card'>
          <div className='card-header'>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className='icon-badge' style={{ background: 'linear-gradient(135deg,#f59e0b,#ef4444)', width: 38, height: 38, borderRadius: 11, fontSize: 17 }}>
                <LockOutlined />
              </div>
              <div>
                <div className='card-title'>Change Password</div>
                <div className='card-sub'>Use a strong password</div>
              </div>
            </div>
          </div>
          <div className='card-body'>
            <F label='Current Password' err={pwdErr.currentPwd}>
              <PasswordInput
                value={currentPwd}
                onChange={e => { setCurrentPwd(e.target.value); if (pwdErr.currentPwd) setPwdErr(prev => ({ ...prev, currentPwd: '' })); }}
                placeholder='Enter current password'
              />
            </F>
            <F label='New Password (min 6 characters)' err={pwdErr.newPwd}>
              <PasswordInput
                value={newPwd}
                onChange={e => { setNewPwd(e.target.value); if (pwdErr.newPwd) setPwdErr(prev => ({ ...prev, newPwd: '' })); }}
                placeholder='Enter new password'
              />
            </F>
            <F label='Confirm New Password' err={pwdErr.confirmPwd}>
              <PasswordInput
                value={confirmPwd}
                onChange={e => { setConfirmPwd(e.target.value); if (pwdErr.confirmPwd) setPwdErr(prev => ({ ...prev, confirmPwd: '' })); }}
                placeholder='Re-enter new password'
              />
            </F>

            {/* Password strength indicator */}
            {newPwd.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= strength ? strengthColors[strength - 1] : 'var(--border)', transition: 'all .3s' }} />
                  ))}
                </div>
                <span style={{ fontSize: 11, color: strength > 0 ? strengthColors[strength - 1] : 'var(--muted)', fontWeight: 600 }}>
                  {strengthLabels[strength > 0 ? strength - 1 : 0]}
                </span>
              </div>
            )}

            <button
              onClick={handlePasswordChange}
              disabled={savingPwd}
              style={{
                width: '100%', padding: '12px 0', borderRadius: 12, border: 'none',
                background: pwdDone ? 'linear-gradient(135deg,#56ab2f,#a8e063)' : 'linear-gradient(135deg,#f59e0b,#ef4444)',
                color: '#fff', fontWeight: 700, fontSize: 14, cursor: savingPwd ? 'not-allowed' : 'pointer',
                fontFamily: 'Raleway, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: savingPwd ? 0.7 : 1, transition: 'all .3s', boxShadow: '0 4px 14px rgba(245,158,11,.35)',
              }}
            >
              {savingPwd ? <Spin size='small' /> : pwdDone ? <><CheckCircleOutlined /> Password Updated!</> : 'Update Password'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Settings;
