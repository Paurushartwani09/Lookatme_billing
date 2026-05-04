import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { message, Spin, Table, Button, Modal, Empty, Input, Select, Popconfirm } from 'antd';
import { FilePdfOutlined, EyeOutlined, SearchOutlined, DownloadOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const PAY_COLORS = {
  Cash:   { color: '#52c97a', bg: 'rgba(82,201,122,0.12)' },
  Card:   { color: '#4d96ff', bg: 'rgba(77,150,255,0.12)' },
  UPI:    { color: '#6c63ff', bg: 'rgba(108,99,255,0.12)' },
  Cheque: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
};

// Validation helpers
const validatePhone10 = v => { if (!v || !v.trim()) return true; const d = v.replace(/[\s\-()]/g,'').replace(/^\+91/,'').replace(/^0/,''); return /^\d{10}$/.test(d); };
const validateEmail   = v => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const validateName    = v => v.trim().length >= 2 && !/\d/.test(v.trim());

function Records() {
  const [invoices,        setInvoices]        = useState([]);
  const [filtered,        setFiltered]        = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showDetails,     setShowDetails]     = useState(false);
  const [search,          setSearch]          = useState('');

  // Edit invoice state
  const [showEdit,   setShowEdit]   = useState(false);
  const [editInv,    setEditInv]    = useState(null);
  const [editErrors, setEditErrors] = useState({});
  const [saving,     setSaving]     = useState(false);

  useEffect(() => { fetchInvoices(); }, []);

  useEffect(() => {
    if (!search.trim()) { setFiltered(invoices); return; }
    const q = search.toLowerCase();
    setFiltered(invoices.filter(inv =>
      inv.invoice_number?.toLowerCase().includes(q) ||
      inv.customer_name?.toLowerCase().includes(q) ||
      inv.payment_method?.toLowerCase().includes(q)
    ));
  }, [search, invoices]);

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/invoices`, { headers: { Authorization: `Bearer ${token}` } });
      setInvoices(res.data); setFiltered(res.data);
    } catch { message.error('Failed to load invoices'); }
    finally { setLoading(false); }
  };

  const downloadPDF = async (invoiceId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/invoices/${invoiceId}/pdf`, { headers: { Authorization: `Bearer ${token}` } });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `invoice-${invoiceId}.pdf`;
      document.body.appendChild(a); a.click(); window.URL.revokeObjectURL(url); document.body.removeChild(a);
      message.success('PDF downloaded!');
    } catch { message.error('Failed to download PDF'); }
  };

  const viewDetails = async (invoiceId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/invoices/${invoiceId}`, { headers: { Authorization: `Bearer ${token}` } });
      setSelectedInvoice(res.data); setShowDetails(true);
    } catch { message.error('Failed to load invoice details'); }
  };

  // ── Edit Invoice ──────────────────────────────────────────
  const openEdit = (record) => {
    setEditInv({ ...record });
    setEditErrors({});
    setShowEdit(true);
  };

  const validateEditForm = () => {
    const e = {};
    if (!editInv.customer_name?.trim()) e.customer_name = 'Name is required';
    else if (!/^[a-zA-Z\s.\'-]{2,}$/.test(editInv.customer_name.trim())) e.customer_name = 'Name must contain only letters';
    if (editInv.customer_phone?.trim() && !validatePhone10(editInv.customer_phone)) e.customer_phone = 'Enter a valid 10-digit phone number';
    if (editInv.customer_email?.trim() && !validateEmail(editInv.customer_email)) e.customer_email = 'Email must contain @ (e.g. name@email.com)';
    setEditErrors(e);
    return Object.keys(e).length === 0;
  };

  const saveEdit = async () => {
    if (!validateEditForm()) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/invoices/${editInv.id}`, {
        customer_name:  editInv.customer_name,
        customer_phone: editInv.customer_phone,
        customer_email: editInv.customer_email,
        payment_method: editInv.payment_method,
      }, { headers: { Authorization: `Bearer ${token}` } });
      message.success('Invoice updated!');
      setShowEdit(false); setEditInv(null);
      fetchInvoices();
    } catch { message.error('Failed to update invoice'); }
    finally { setSaving(false); }
  };

  // ── Delete Invoice ────────────────────────────────────────
  const deleteInvoice = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/invoices/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      message.success('Invoice deleted!');
      fetchInvoices();
    } catch { message.error('Failed to delete invoice'); }
  };

  const totalRevenue = filtered.reduce((s, inv) => s + (inv.total_amount || 0), 0);

  const btnStyle = (bg, color) => ({
    padding: '6px 11px', background: bg, color, border: 'none', borderRadius: 8,
    cursor: 'pointer', fontWeight: 700, fontSize: 12, fontFamily: 'Raleway, sans-serif',
    display: 'flex', alignItems: 'center', gap: 4, transition: 'all .2s',
  });

  const columns = [
    {
      title: 'Invoice #', dataIndex: 'invoice_number', key: 'invoice_number',
      render: n => <span style={{ fontWeight: 700, color: 'var(--primary)', fontFamily: 'monospace', fontSize: 13 }}>{n}</span>,
    },
    {
      title: 'Customer', dataIndex: 'customer_name', key: 'customer_name',
      render: name => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#667eea,#764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
            {name?.charAt(0)?.toUpperCase()}
          </div>
          <span style={{ fontWeight: 600, color: 'var(--text)', fontFamily: 'Raleway, sans-serif' }}>{name}</span>
        </div>
      ),
    },
    {
      title: 'Amount', dataIndex: 'total_amount', key: 'total_amount',
      render: a => <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)', fontFamily: 'Raleway, sans-serif' }}>₹{a.toLocaleString('en-IN')}</span>,
      sorter: (a, b) => a.total_amount - b.total_amount,
    },
    {
      title: 'Payment', dataIndex: 'payment_method', key: 'payment_method',
      render: m => { const c = PAY_COLORS[m] || { color: '#9ca3af', bg: '#f3f4f6' }; return <span style={{ background: c.bg, color: c.color, padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, fontFamily: 'Raleway, sans-serif' }}>{m}</span>; },
    },
    {
      title: 'Date', dataIndex: 'created_at', key: 'created_at',
      render: d => (
        <div style={{ fontFamily: 'Raleway, sans-serif' }}>
          <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 13 }}>{new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
      ),
      sorter: (a, b) => new Date(b.created_at) - new Date(a.created_at),
    },
    {
      title: 'Actions', key: 'actions',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button onClick={() => viewDetails(record.id)} style={btnStyle('rgba(108,99,255,0.1)', 'var(--primary)')}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(108,99,255,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(108,99,255,0.1)'}>
            <EyeOutlined /> View
          </button>
          <button onClick={() => downloadPDF(record.id)} style={btnStyle('rgba(255,107,107,0.1)', 'var(--red)')}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,107,107,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,107,107,0.1)'}>
            <FilePdfOutlined /> PDF
          </button>
          <button onClick={() => openEdit(record)} style={btnStyle('rgba(245,158,11,0.1)', '#f59e0b')}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,158,11,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(245,158,11,0.1)'}>
            <EditOutlined /> Edit
          </button>
          <Popconfirm
            title="Delete this invoice?"
            description="This will permanently delete the invoice and all its items."
            onConfirm={() => deleteInvoice(record.id)}
            okText="Delete" cancelText="Cancel" okButtonProps={{ danger: true }}
          >
            <button style={btnStyle('rgba(255,77,79,0.1)', '#ff4d4f')}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,77,79,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,77,79,0.1)'}>
              <DeleteOutlined /> Delete
            </button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}><Spin size="large" /></div>;

  const EF = ({ label, err, children }) => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: err ? '#ef4444' : 'var(--text)', marginBottom: 6, fontFamily: 'Raleway, sans-serif' }}>
        {label}{err && <span style={{ color: '#ef4444', fontSize: 11, fontWeight: 500, marginLeft: 8 }}>{err}</span>}
      </label>
      {children}
    </div>
  );

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>

      {/* Summary Cards */}
      <div className="records-stats">
        {[
          { label: 'Total Invoices',   value: filtered.length,                                                         icon: '📄', bg: 'rgba(108,99,255,0.1)' },
          { label: 'Total Revenue',    value: `₹${totalRevenue.toLocaleString('en-IN')}`,                              icon: '💰', bg: 'rgba(82,201,122,0.1)' },
          { label: 'Cash Payments',    value: filtered.filter(i => i.payment_method === 'Cash').length,                icon: '💵', bg: 'rgba(245,158,11,0.1)' },
          { label: 'Digital Payments', value: filtered.filter(i => ['Card','UPI'].includes(i.payment_method)).length,  icon: '📱', bg: 'rgba(77,150,255,0.1)' },
        ].map(card => (
          <div key={card.label} className="rec-stat">
            <div className="rec-stat-icon" style={{ background: card.bg }}>{card.icon}</div>
            <div><div className="rec-stat-value">{card.value}</div><div className="rec-stat-label">{card.label}</div></div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="records-table-card" style={{overflow:"auto"}}>
        <div className="records-table-header">
          <div>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--text)', fontFamily: 'Raleway, sans-serif' }}>All Invoices</h3>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted)' }}>Complete billing history</p>
          </div>
          <Input prefix={<SearchOutlined style={{ color: 'var(--muted)' }} />} placeholder="Search by invoice, customer, payment..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: 300, borderRadius: 10, border: '2px solid var(--border)', height: 40, fontFamily: 'Raleway, sans-serif' }} allowClear />
        </div>
        {filtered.length > 0 ? (
          <Table columns={columns} dataSource={filtered.map((inv, i) => ({ ...inv, key: i }))}
            pagination={{ pageSize: 10, size: 'small', showTotal: t => `${t} invoices` }} size="middle" style={{ padding: '0 8px' }} />
        ) : (
          <Empty description={<span style={{ color: 'var(--muted)', fontSize: 15, fontFamily: 'Raleway, sans-serif' }}>{search ? 'No invoices match your search' : 'No invoices yet'}</span>} style={{ padding: '60px 24px' }} />
        )}
      </div>

      {/* ── View Details Modal ─────────────────────────────── */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#667eea,#764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16 }}><FilePdfOutlined /></div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, fontFamily: 'Raleway, sans-serif' }}>Invoice Details</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 400 }}>{selectedInvoice?.invoice_number}</div>
            </div>
          </div>
        }
        open={showDetails} onCancel={() => setShowDetails(false)}
        footer={[
          <Button key="close" onClick={() => setShowDetails(false)} style={{ borderRadius: 10, fontFamily: 'Raleway, sans-serif' }}>Close</Button>,
          <Button key="pdf" type="primary" icon={<DownloadOutlined />} onClick={() => { downloadPDF(selectedInvoice?.id); setShowDetails(false); }}
            style={{ borderRadius: 10, background: 'linear-gradient(135deg,#667eea,#764ba2)', border: 'none', fontWeight: 700, fontFamily: 'Raleway, sans-serif' }}>Download PDF</Button>,
        ]} width={680}
      >
        {selectedInvoice && (
          <div>
            <div style={{ background: 'linear-gradient(135deg,rgba(108,99,255,.06),rgba(118,75,162,.06))', borderRadius: 14, padding: '20px 24px', marginBottom: 20, border: '1px solid rgba(108,99,255,.12)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  { label: 'Invoice Number', value: selectedInvoice.invoice_number },
                  { label: 'Date', value: new Date(selectedInvoice.created_at).toLocaleString() },
                  { label: 'Customer', value: selectedInvoice.customer_name },
                  { label: 'Phone', value: selectedInvoice.customer_phone || '—' },
                  { label: 'Email', value: selectedInvoice.customer_email || '—' },
                  { label: 'Payment', value: selectedInvoice.payment_method },
                ].map(f => (
                  <div key={f.label}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4, fontFamily: 'Raleway, sans-serif' }}>{f.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', fontFamily: 'Raleway, sans-serif' }}>{f.value}</div>
                  </div>
                ))}
              </div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20 }}>
              <thead><tr style={{ background: 'var(--bg)' }}>
                {['Product', 'Qty', 'Unit Price', 'Total'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: h === 'Product' ? 'left' : 'right', fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', fontFamily: 'Raleway, sans-serif' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {selectedInvoice.items?.map((item, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--text)', fontFamily: 'Raleway, sans-serif' }}>{item.product_name}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', color: 'var(--muted)', fontFamily: 'Raleway, sans-serif' }}>{item.quantity}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', color: 'var(--muted)', fontFamily: 'Raleway, sans-serif' }}>₹{item.unit_price.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: 'var(--text)', fontFamily: 'Raleway, sans-serif' }}>₹{item.total_price.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ background: 'var(--bg)', borderRadius: 12, padding: '16px 20px' }}>
              {[
                { label: 'Subtotal', value: `₹${(selectedInvoice.total_amount - selectedInvoice.tax_amount + selectedInvoice.discount_amount).toLocaleString('en-IN')}` },
                selectedInvoice.tax_amount > 0 && { label: 'Tax', value: `₹${selectedInvoice.tax_amount.toLocaleString('en-IN')}` },
                selectedInvoice.discount_amount > 0 && { label: 'Discount', value: `-₹${selectedInvoice.discount_amount.toLocaleString('en-IN')}` },
              ].filter(Boolean).map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14, color: 'var(--muted)', fontFamily: 'Raleway, sans-serif' }}>
                  <span>{row.label}</span><span style={{ fontWeight: 600 }}>{row.value}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '2px solid var(--border)', marginTop: 4 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', fontFamily: 'Raleway, sans-serif' }}>Total</span>
                <span style={{ fontSize: 20, fontWeight: 800, background: 'linear-gradient(135deg,#667eea,#764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontFamily: 'Raleway, sans-serif' }}>₹{selectedInvoice.total_amount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Edit Invoice Modal ─────────────────────────────── */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#f59e0b,#ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16 }}><EditOutlined /></div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, fontFamily: 'Raleway, sans-serif' }}>Edit Invoice</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 400 }}>{editInv?.invoice_number}</div>
            </div>
          </div>
        }
        open={showEdit} onCancel={() => { setShowEdit(false); setEditInv(null); setEditErrors({}); }}
        onOk={saveEdit} okText="Save Changes" confirmLoading={saving}
        okButtonProps={{ style: { background: 'linear-gradient(135deg,#f59e0b,#ef4444)', border: 'none', fontWeight: 700, fontFamily: 'Raleway, sans-serif' } }}
        width={520}
      >
        {editInv && (
          <div style={{ paddingTop: 8 }}>
            <EF label="Customer Name *" err={editErrors.customer_name}>
              <Input
                value={editInv.customer_name}
                onChange={e => { const v = e.target.value.replace(/[0-9]/g, ''); setEditInv({ ...editInv, customer_name: v }); if (editErrors.customer_name) setEditErrors({ ...editErrors, customer_name: '' }); }}
                placeholder="Full name (letters only)" size="large"
                status={editErrors.customer_name ? 'error' : ''}
              />
            </EF>
            <EF label="Phone Number (10 digits)" err={editErrors.customer_phone}>
              <Input
                value={editInv.customer_phone || ''}
                onChange={e => { const v = e.target.value.replace(/[^\d\s\-+()]/g, ''); setEditInv({ ...editInv, customer_phone: v }); if (editErrors.customer_phone) setEditErrors({ ...editErrors, customer_phone: '' }); }}
                placeholder="98765 43210" size="large" maxLength={15}
                status={editErrors.customer_phone ? 'error' : ''}
              />
            </EF>
            <EF label="Email Address" err={editErrors.customer_email}>
              <Input
                value={editInv.customer_email || ''}
                onChange={e => { setEditInv({ ...editInv, customer_email: e.target.value }); if (editErrors.customer_email) setEditErrors({ ...editErrors, customer_email: '' }); }}
                placeholder="name@email.com" size="large"
                status={editErrors.customer_email ? 'error' : ''}
              />
            </EF>
            <EF label="Payment Method">
              <Select
                value={editInv.payment_method}
                onChange={v => setEditInv({ ...editInv, payment_method: v })}
                size="large" style={{ width: '100%' }}
                options={[
                  { value: 'Cash',   label: '💵 Cash'   },
                  { value: 'Card',   label: '💳 Card'   },
                  { value: 'UPI',    label: '📱 UPI'    },
                  { value: 'Cheque', label: '📝 Cheque' },
                ]}
              />
            </EF>
            <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#f59e0b', fontWeight: 600, fontFamily: 'Raleway, sans-serif' }}>
              ⚠️ Note: Invoice items and amounts cannot be edited. Only customer details and payment method can be updated.
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Records;
