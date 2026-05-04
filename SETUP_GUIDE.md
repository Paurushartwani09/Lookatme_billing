# Look @ me Billing System - Complete Setup Guide

## Quick Start (5 Minutes)

### Step 1: Start the Backend Server
Open a terminal/command prompt and run:
```bash
cd billing-system
node server.js
```

You should see:
```
Connected to SQLite database
Default admin user created (username: admin, password: admin123)
Server running on http://localhost:5000
```

### Step 2: Start the Frontend (in a new terminal)
```bash
cd billing-system
npm run dev
```

You should see:
```
VITE v8.0.10  ready in XXX ms
➜  Local:   http://localhost:5173/
```

### Step 3: Open in Browser
- Go to `http://localhost:5173`
- Login with:
  - Username: `admin`
  - Password: `admin123`

## System Requirements

- **Node.js**: v14 or higher
- **npm**: v6 or higher
- **RAM**: 512MB minimum
- **Disk Space**: 100MB
- **Browser**: Chrome, Firefox, Safari, or Edge (latest versions)

## Installation Details

### Full Installation from Scratch

1. **Create project directory**
   ```bash
   mkdir billing-system
   cd billing-system
   ```

2. **Initialize Node project**
   ```bash
   npm init -y
   ```

3. **Install all dependencies**
   ```bash
   npm install express cors sqlite3 bcryptjs jsonwebtoken dotenv pdfkit uuid axios antd react react-dom vite @vitejs/plugin-react
   ```

4. **Copy all files** from the provided project

5. **Create .env file**
   ```
   PORT=5000
   JWT_SECRET=your-secret-key-change-in-production
   NODE_ENV=development
   ```

## Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
node server.js
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### Production Build

```bash
npm run build
```

This creates an optimized build in the `dist` folder.

## File Structure Explanation

```
billing-system/
│
├── src/                          # React frontend source
│   ├── pages/
│   │   ├── Login.jsx            # Authentication page
│   │   ├── Dashboard.jsx        # Main dashboard with stats
│   │   ├── BillingModule.jsx    # Bill creation interface
│   │   └── Records.jsx          # Invoice history and records
│   ├── App.jsx                  # Main app component
│   ├── App.css                  # All styling
│   └── main.jsx                 # React entry point
│
├── server.js                    # Express backend server
├── package.json                 # Project dependencies
├── vite.config.js              # Vite build configuration
├── index.html                  # HTML template
├── .env                        # Environment variables
├── billing.db                  # SQLite database (auto-created)
└── README.md                   # Documentation
```

## Database

### Auto-Creation
The database (`billing.db`) is automatically created on first run with:
- Admin user table
- Products table
- Invoices table
- Invoice items table
- Activity logs table

### Sample Data
Default products are automatically added:
- Laptop (₹50,000)
- Mouse (₹500)
- Keyboard (₹1,500)
- Monitor (₹15,000)
- USB Cable (₹200)
- Headphones (₹3,000)

### Reset Database
To reset and start fresh:
1. Stop the server
2. Delete `billing.db` file
3. Restart the server

## Features Walkthrough

### 1. Login Page
- Enter credentials
- Session token is stored in browser
- Auto-logout after 24 hours

### 2. Dashboard
- **Today's Invoices**: Count of bills created today
- **Today's Revenue**: Total sales amount for today
- **Total Products**: Number of products in inventory
- **Recent Activity**: Log of all system actions

### 3. Create Bill
- **Customer Details**: Name, phone, email
- **Product Selection**: Click products to add to cart
- **Cart Management**: Adjust quantities, remove items
- **Calculations**: Automatic tax and discount
- **Payment Method**: Cash, Card, UPI, Cheque
- **PDF Download**: Automatic invoice generation

### 4. Records
- **Invoice List**: All historical invoices
- **Search**: Find invoices by number or customer
- **View Details**: See complete invoice information
- **Download PDF**: Get invoice as PDF file

## Customization Guide

### Change Shop Name
1. Open `server.js` - Line 1 (in PDF generation)
2. Open `App.jsx` - Line 30 (in header)
3. Open `Login.jsx` - Line 30 (in login page)
4. Replace "Look @ me" with your shop name

### Change Colors
Edit `App.css`:
- Primary Purple: `#667eea` → your color
- Dark Purple: `#764ba2` → your color
- Green Accent: `#52c41a` → your color

### Add Products
1. In app: Click "Add New Product" button
2. Or directly in database using SQLite browser

### Change Admin Password
1. Delete `billing.db`
2. Restart server (creates new admin with default password)
3. Or use SQLite browser to update password hash

## Troubleshooting

### Issue: "Port 5000 already in use"
**Solution:**
- Change PORT in `.env` file to 5001, 5002, etc.
- Or kill the process using port 5000

### Issue: "Cannot find module 'express'"
**Solution:**
```bash
npm install
```

### Issue: "Database locked"
**Solution:**
- Close all instances of the app
- Delete `billing.db`
- Restart

### Issue: "CORS error"
**Solution:**
- Ensure backend is running on port 5000
- Ensure frontend is running on port 5173
- Check that both are accessible

### Issue: "PDF not downloading"
**Solution:**
- Check browser console for errors
- Ensure backend server is running
- Try a different browser

### Issue: "Login fails"
**Solution:**
- Check username and password (case-sensitive)
- Delete `billing.db` and restart to reset to defaults
- Check browser console for error messages

## Performance Tips

1. **Optimize Database**
   - Regularly backup `billing.db`
   - Archive old invoices periodically

2. **Browser Performance**
   - Clear browser cache regularly
   - Use modern browser version
   - Close unnecessary tabs

3. **Server Performance**
   - Monitor system resources
   - Restart server weekly
   - Keep Node.js updated

## Security Best Practices

1. **Change Default Password**
   - Immediately after first login
   - Use strong password (12+ characters)

2. **Environment Variables**
   - Change `JWT_SECRET` in production
   - Never commit `.env` to version control

3. **Database Backup**
   - Backup `billing.db` regularly
   - Store backups securely

4. **Access Control**
   - Limit admin access
   - Use unique passwords
   - Monitor activity logs

## Deployment

### Local Network
1. Find your computer's IP address
2. Update frontend API URL to `http://YOUR_IP:5000/api`
3. Access from other computers on network

### Cloud Deployment
For production deployment:
1. Use a proper database (PostgreSQL, MySQL)
2. Deploy backend to cloud (Heroku, AWS, DigitalOcean)
3. Deploy frontend to CDN (Vercel, Netlify)
4. Use HTTPS
5. Set up proper authentication
6. Configure backups

## Support & Help

### Common Questions

**Q: Can multiple users use this simultaneously?**
A: Yes, but they'll share the same admin account. For multi-user, modify the authentication system.

**Q: How do I backup my data?**
A: Copy the `billing.db` file to a safe location.

**Q: Can I use this on mobile?**
A: Yes, the interface is responsive. Access via mobile browser.

**Q: How do I add more products?**
A: Use the "Add New Product" button in the billing module.

**Q: Can I modify the PDF format?**
A: Yes, edit the PDF generation code in `server.js` (lines 300-400).

## Next Steps

1. ✅ Install and run the system
2. ✅ Login with default credentials
3. ✅ Add your products
4. ✅ Create a test bill
5. ✅ Download the PDF
6. ✅ Change admin password
7. ✅ Customize colors and branding
8. ✅ Start using for real billing

## Contact & Support

For issues or questions:
1. Check the README.md file
2. Review code comments
3. Check browser console for errors
4. Verify all services are running

---

**Happy Billing! 🎉**

Your professional billing system is ready to use.
