# Look @ me Billing System - Quick Reference Guide

## 🚀 Quick Start (Copy & Paste)

### Windows Users
1. Open Command Prompt
2. Navigate to project: `cd "D:\Office Work\My New Project\billing-system"`
3. Run: `start.bat`
4. Open browser: `http://localhost:5173`
5. Login: `admin` / `admin123`

### Mac/Linux Users
```bash
cd billing-system
# Terminal 1
node server.js

# Terminal 2 (new terminal)
npm run dev
```

---

## 📋 Default Credentials

```
Username: admin
Password: admin123
```

⚠️ **Change immediately after first login!**

---

## 🔗 URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000 |
| Database | billing.db (local file) |

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `server.js` | Backend server |
| `src/App.jsx` | Main React component |
| `src/pages/` | Page components |
| `src/App.css` | All styling |
| `billing.db` | SQLite database |
| `.env` | Environment variables |

---

## 🎯 Main Features

### 1. Login
- Secure authentication
- JWT tokens
- 24-hour expiration

### 2. Dashboard
- Today's invoices count
- Today's revenue
- Total products
- Recent activity log

### 3. Create Bill
- Customer details
- Product selection
- Cart management
- Tax & discount
- PDF download

### 4. Records
- Invoice history
- View details
- Download PDF
- Search & filter

---

## 🛠️ Common Commands

```bash
# Start backend
node server.js

# Start frontend
npm run dev

# Build for production
npm run build

# Install dependencies
npm install

# Reset database
# Delete billing.db and restart server
```

---

## 🎨 Customization Quick Tips

### Change Shop Name
1. `server.js` - Line 1 (PDF header)
2. `App.jsx` - Line 30 (Header title)
3. `Login.jsx` - Line 30 (Login page)

### Change Colors
Edit `App.css`:
- `#667eea` = Primary Purple
- `#764ba2` = Dark Purple
- `#52c41a` = Green Accent

### Add Products
1. Click "Add New Product" in billing module
2. Enter name, price, category
3. Click OK

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 5000 in use | Change PORT in `.env` |
| Module not found | Run `npm install` |
| Database locked | Delete `billing.db` |
| CORS error | Check both servers running |
| PDF not downloading | Check backend is running |
| Login fails | Check username/password |

---

## 📊 Database Tables

### admins
- id, username, password, email, created_at

### products
- id, name, price, category, stock, created_at

### invoices
- id, invoice_number, customer_name, customer_phone, customer_email, total_amount, tax_amount, discount_amount, payment_method, status, created_by, created_at

### invoice_items
- id, invoice_id, product_id, product_name, quantity, unit_price, total_price

### activity_logs
- id, admin_id, action, details, created_at

---

## 🔐 Security Checklist

- [ ] Change default admin password
- [ ] Update JWT_SECRET in .env
- [ ] Backup billing.db regularly
- [ ] Monitor activity logs
- [ ] Use HTTPS in production
- [ ] Restrict database access
- [ ] Keep Node.js updated

---

## 📱 Responsive Breakpoints

| Device | Width | Layout |
|--------|-------|--------|
| Mobile | < 768px | Single column |
| Tablet | 768-1024px | Two columns |
| Desktop | > 1024px | Full layout |

---

## 🎯 API Endpoints

### Authentication
```
POST /api/auth/login
```

### Products
```
GET /api/products
POST /api/products
```

### Invoices
```
POST /api/invoices
GET /api/invoices
GET /api/invoices/:id
GET /api/invoices/:id/pdf
```

### Dashboard
```
GET /api/dashboard/stats
GET /api/activity-logs
```

---

## 💡 Tips & Tricks

1. **Keyboard Shortcuts**
   - Tab: Navigate between fields
   - Enter: Submit forms
   - Esc: Close modals

2. **Bulk Operations**
   - Add multiple products quickly
   - Use same customer details for repeat customers
   - Copy invoice numbers for reference

3. **Performance**
   - Clear browser cache weekly
   - Backup database monthly
   - Restart server weekly

4. **Data Entry**
   - Use Tab to move between fields
   - Quantity defaults to 1
   - Tax/discount are optional

---

## 📞 Support Resources

| Resource | Location |
|----------|----------|
| Full Documentation | README.md |
| Setup Guide | SETUP_GUIDE.md |
| Features List | FEATURES.md |
| This Guide | QUICK_REFERENCE.md |

---

## 🔄 Typical Workflow

```
1. Start Backend (node server.js)
   ↓
2. Start Frontend (npm run dev)
   ↓
3. Open Browser (http://localhost:5173)
   ↓
4. Login (admin/admin123)
   ↓
5. View Dashboard
   ↓
6. Create Bill
   ↓
7. Download PDF
   ↓
8. View Records
   ↓
9. Logout
```

---

## 📈 Business Metrics

### Daily Tracking
- Invoices created
- Revenue generated
- Payment methods used
- Customer count

### Monthly Tracking
- Total revenue
- Average transaction
- Product popularity
- Admin activity

---

## 🎓 Learning Path

### Beginner
1. Login and explore dashboard
2. Create your first bill
3. Download PDF
4. View records

### Intermediate
1. Add custom products
2. Manage inventory
3. Review activity logs
4. Customize colors

### Advanced
1. Modify database schema
2. Add new features
3. Deploy to production
4. Integrate with other systems

---

## 🚀 Deployment Checklist

- [ ] Change admin password
- [ ] Update JWT_SECRET
- [ ] Set NODE_ENV=production
- [ ] Configure HTTPS
- [ ] Setup database backups
- [ ] Configure firewall
- [ ] Test all features
- [ ] Document customizations
- [ ] Train users
- [ ] Monitor performance

---

## 📊 File Sizes

| Component | Size |
|-----------|------|
| Frontend Build | ~500KB |
| Backend | ~50KB |
| Database (empty) | ~50KB |
| Total | ~600KB |

---

## ⚡ Performance Targets

| Metric | Target |
|--------|--------|
| Page Load | < 2s |
| API Response | < 500ms |
| PDF Generation | < 3s |
| Database Query | < 100ms |

---

## 🎯 Success Metrics

- ✅ System runs without errors
- ✅ Bills created successfully
- ✅ PDFs download correctly
- ✅ Data persists after restart
- ✅ All features working
- ✅ Responsive on all devices

---

## 📝 Notes

- Database auto-creates on first run
- Sample products pre-loaded
- Default admin account created
- All data stored locally
- No internet required
- Backup regularly

---

## 🎉 You're Ready!

Your professional billing system is ready to use. Start creating bills and managing your business efficiently!

**Questions?** Check the full documentation files.

---

**Last Updated:** April 2026
**Version:** 1.0.0
**Status:** Production Ready ✅
