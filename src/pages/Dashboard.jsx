import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Spin, Table, Empty, Tag } from 'antd';
import {
  FileTextOutlined, RiseOutlined, AppstoreOutlined,
  ClockCircleOutlined, LoginOutlined, PlusCircleOutlined,
  FileDoneOutlined, DownloadOutlined,
} from '@ant-design/icons';
import ButterflyLogo from '../components/ButterflyLogo';

const API_URL = 'http://localhost:5000/api';

const actionConfig = {
  LOGIN:          { color: '#6c63ff', bg: 'rgba(108,99,255,0.1)', icon: <LoginOutlined />,       label: 'Login'           },
  ADD_PRODUCT:    { color: '#52c97a', bg: 'rgba(82,201,122,0.1)', icon: <PlusCircleOutlined />,  label: 'Product Added'   },
  CREATE_INVOICE: { color: '#4d96ff', bg: 'rgba(77,150,255,0.1)', icon: <FileDoneOutlined />,    label: 'Invoice Created' },
  DOWNLOAD_PDF:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: <DownloadOutlined />,    label: 'PDF Downloaded'  },
};

function StatCard({ icon, value, label, color, gradient, barColor }) {
  return (
    <div
      className="stat-card"
      style={{ '--bar': barColor || color }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = `0 12px 32px ${color}22`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow)';
      }}
    >
      <div className="icon-badge" style={{ background: gradient, boxShadow: `0 8px 20px ${color}40` }}>
        {icon}
      </div>
      <div className="stat-card-body">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const [statsRes, logsRes] = await Promise.all([
        axios.get(`${API_URL}/dashboard/stats`, { headers }),
        axios.get(`${API_URL}/activity-logs`, { headers }),
      ]);
      setStats(statsRes.data);
      setActivityLogs(logsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: 200,
      render: (action) => {
        const cfg = actionConfig[action] || { color: '#9ca3af', bg: '#f3f4f6', icon: <ClockCircleOutlined />, label: action };
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: cfg.bg, color: cfg.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
            }}>
              {cfg.icon}
            </div>
            <Tag color={cfg.color} style={{ border: 'none', fontWeight: 700, borderRadius: 6, fontFamily: 'Raleway, sans-serif' }}>
              {cfg.label}
            </Tag>
          </div>
        );
      },
    },
    {
      title: 'Details',
      dataIndex: 'details',
      key: 'details',
      ellipsis: true,
      render: (text) => <span style={{ color: '#6b7280', fontSize: 14, fontFamily: 'Raleway, sans-serif' }}>{text}</span>,
    },
    {
      title: 'Time',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 200,
      render: (text) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#9ca3af', fontSize: 13, fontFamily: 'Raleway, sans-serif' }}>
          <ClockCircleOutlined />
          {new Date(text).toLocaleString()}
        </div>
      ),
    },
  ];

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
      <Spin size="large" />
    </div>
  );

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', width: '100%', minWidth: 0 }}>

      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-text">
          <h2 className="welcome-title">{greeting}! 🌟</h2>
          <p className="welcome-sub">Here's what's happening with your shop today.</p>
        </div>
        <div className="welcome-logo">
          <ButterflyLogo size={80} />
        </div>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <StatCard
          icon={<FileTextOutlined style={{ fontSize: 26 }} />}
          value={stats?.today_invoices || 0}
          label="Invoices Today"
          color="#6c63ff"
          gradient="linear-gradient(135deg,#667eea,#764ba2)"
          barColor="#6c63ff"
        />
        <StatCard
          icon={<RiseOutlined style={{ fontSize: 26 }} />}
          value={`₹${(stats?.today_revenue || 0).toLocaleString('en-IN')}`}
          label="Revenue Today"
          color="#52c97a"
          gradient="linear-gradient(135deg,#56ab2f,#a8e063)"
          barColor="#52c97a"
        />
        <StatCard
          icon={<AppstoreOutlined style={{ fontSize: 26 }} />}
          value={stats?.total_products || 0}
          label="Total Products"
          color="#4d96ff"
          gradient="linear-gradient(135deg,#4d96ff,#1e90ff)"
          barColor="#4d96ff"
        />
      </div>

      {/* Activity Log */}
      <div className="activity-card">
        <div className="activity-header">
          <div>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--text)', fontFamily: 'Raleway, sans-serif' }}>
              Recent Activity
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted)' }}>
              Latest actions in your billing system
            </p>
          </div>
          <div className="activity-count">{activityLogs.length} entries</div>
        </div>

        {activityLogs.length > 0 ? (
          <div style={{ overflowX: 'auto', width: '100%' }}>
          <Table
            columns={columns}
            dataSource={activityLogs.map((log, i) => ({ ...log, key: i }))}
            pagination={{ pageSize: 8, size: 'small' }}
            size="middle"
            style={{ padding: '0 8px' }}
            scroll={{ x: 500 }}
          />
          </div>
        ) : (
          <Empty
            description={<span style={{ color: 'var(--muted)', fontFamily: 'Raleway, sans-serif' }}>No activity recorded yet</span>}
            style={{ padding: '60px 24px' }}
          />
        )}
      </div>
    </div>
  );
}

export default Dashboard;
