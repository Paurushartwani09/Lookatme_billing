const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const PDFDocument = require('pdfkit');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const db = new sqlite3.Database('./billing.db', (err) => {
  if (err) console.error('Database error:', err);
  else console.log('Connected to SQLite database');
});

// Initialize database tables
const initializeDatabase = () => {
  db.serialize(() => {
    // Admin users table
    db.run(`
      CREATE TABLE IF NOT EXISTS admins (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Products table
    db.run(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        category TEXT,
        stock INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Invoices table
    db.run(`
      CREATE TABLE IF NOT EXISTS invoices (
        id TEXT PRIMARY KEY,
        invoice_number TEXT UNIQUE NOT NULL,
        customer_name TEXT NOT NULL,
        customer_phone TEXT,
        customer_email TEXT,
        total_amount REAL NOT NULL,
        tax_amount REAL DEFAULT 0,
        discount_amount REAL DEFAULT 0,
        payment_method TEXT,
        status TEXT DEFAULT 'completed',
        created_by TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES admins(id)
      )
    `);

    // Invoice items table
    db.run(`
      CREATE TABLE IF NOT EXISTS invoice_items (
        id TEXT PRIMARY KEY,
        invoice_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        product_name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price REAL NOT NULL,
        total_price REAL NOT NULL,
        FOREIGN KEY (invoice_id) REFERENCES invoices(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);

    // Activity log table
    db.run(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id TEXT PRIMARY KEY,
        admin_id TEXT NOT NULL,
        action TEXT NOT NULL,
        details TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (admin_id) REFERENCES admins(id)
      )
    `);

    // Create default admin if not exists
    const defaultAdminId = uuidv4();
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    
    db.run(
      `INSERT OR IGNORE INTO admins (id, username, password, email) VALUES (?, ?, ?, ?)`,
      [defaultAdminId, 'admin', hashedPassword, 'admin@lookatme.com'],
      (err) => {
        if (!err) console.log('Default admin user created (username: admin, password: admin123)');
      }
    );

    // Insert sample products
    const sampleProducts = [
      { name: 'Laptop', price: 50000, category: 'Electronics' },
      { name: 'Mouse', price: 500, category: 'Accessories' },
      { name: 'Keyboard', price: 1500, category: 'Accessories' },
      { name: 'Monitor', price: 15000, category: 'Electronics' },
      { name: 'USB Cable', price: 200, category: 'Accessories' },
      { name: 'Headphones', price: 3000, category: 'Audio' },
    ];

    sampleProducts.forEach(product => {
      db.run(
        `INSERT OR IGNORE INTO products (id, name, price, category, stock) VALUES (?, ?, ?, ?, ?)`,
        [uuidv4(), product.name, product.price, product.category, 100]
      );
    });
  });
};

initializeDatabase();

// Helper function to log activities
const logActivity = (adminId, action, details) => {
  db.run(
    `INSERT INTO activity_logs (id, admin_id, action, details) VALUES (?, ?, ?, ?)`,
    [uuidv4(), adminId, action, details]
  );
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// ==================== AUTH ROUTES ====================

// Login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  db.get(`SELECT * FROM admins WHERE username = ?`, [username], (err, admin) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!admin) return res.status(401).json({ error: 'Invalid credentials' });

    const passwordMatch = bcrypt.compareSync(password, admin.password);
    if (!passwordMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, {
      expiresIn: '24h',
    });

    logActivity(admin.id, 'LOGIN', `User ${username} logged in`);
    res.json({ token, admin: { id: admin.id, username: admin.username, email: admin.email } });
  });
});

// ==================== PRODUCT ROUTES ====================

// Get all products
app.get('/api/products', authenticateToken, (req, res) => {
  db.all(`SELECT * FROM products ORDER BY name`, (err, products) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(products);
  });
});

// Add product
app.post('/api/products', authenticateToken, (req, res) => {
  const { name, price, category, stock } = req.body;

  if (!name || !price) {
    return res.status(400).json({ error: 'Name and price required' });
  }

  const productId = uuidv4();
  db.run(
    `INSERT INTO products (id, name, price, category, stock) VALUES (?, ?, ?, ?, ?)`,
    [productId, name, price, category || 'General', stock || 0],
    (err) => {
      if (err) return res.status(500).json({ error: 'Failed to add product' });
      logActivity(req.user.id, 'ADD_PRODUCT', `Added product: ${name}`);
      res.status(201).json({ id: productId, name, price, category, stock });
    }
  );
});

// Update product
app.put('/api/products/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { name, price, category, stock } = req.body;

  if (!name || !price) {
    return res.status(400).json({ error: 'Name and price required' });
  }

  db.run(
    `UPDATE products SET name = ?, price = ?, category = ?, stock = ? WHERE id = ?`,
    [name, price, category || 'General', stock || 0, id],
    function(err) {
      if (err) return res.status(500).json({ error: 'Failed to update product' });
      if (this.changes === 0) return res.status(404).json({ error: 'Product not found' });
      logActivity(req.user.id, 'EDIT_PRODUCT', `Updated product: ${name}`);
      res.json({ id, name, price, category, stock });
    }
  );
});

// Delete product
app.delete('/api/products/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM products WHERE id = ?`, [id], function(err) {
    if (err) return res.status(500).json({ error: 'Failed to delete product' });
    if (this.changes === 0) return res.status(404).json({ error: 'Product not found' });
    logActivity(req.user.id, 'DELETE_PRODUCT', `Deleted product id: ${id}`);
    res.json({ success: true });
  });
});

// Generate invoice number
const generateInvoiceNumber = (callback) => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  
  db.get(
    `SELECT COUNT(*) as count FROM invoices WHERE created_at LIKE ?`,
    [`${date.toISOString().slice(0, 10)}%`],
    (err, row) => {
      const count = (row?.count || 0) + 1;
      const invoiceNumber = `INV-${dateStr}-${String(count).padStart(4, '0')}`;
      callback(invoiceNumber);
    }
  );
};

// Create invoice
app.post('/api/invoices', authenticateToken, (req, res) => {
  const { customer_name, customer_phone, customer_email, items, tax_amount, discount_amount, payment_method } = req.body;

  if (!customer_name || !items || items.length === 0) {
    return res.status(400).json({ error: 'Customer name and items required' });
  }

  generateInvoiceNumber((invoiceNumber) => {
    const invoiceId = uuidv4();
    const totalAmount = items.reduce((sum, item) => sum + item.total_price, 0) + (tax_amount || 0) - (discount_amount || 0);

    db.run(
      `INSERT INTO invoices (id, invoice_number, customer_name, customer_phone, customer_email, total_amount, tax_amount, discount_amount, payment_method, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [invoiceId, invoiceNumber, customer_name, customer_phone, customer_email, totalAmount, tax_amount || 0, discount_amount || 0, payment_method || 'Cash', req.user.id],
      (err) => {
        if (err) return res.status(500).json({ error: 'Failed to create invoice' });

        // Insert invoice items
        let itemsInserted = 0;
        items.forEach((item) => {
          const itemId = uuidv4();
          db.run(
            `INSERT INTO invoice_items (id, invoice_id, product_id, product_name, quantity, unit_price, total_price)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [itemId, invoiceId, item.product_id, item.product_name, item.quantity, item.unit_price, item.total_price],
            (err) => {
              itemsInserted++;
              if (itemsInserted === items.length) {
                logActivity(req.user.id, 'CREATE_INVOICE', `Created invoice: ${invoiceNumber}`);
                res.status(201).json({
                  id: invoiceId,
                  invoice_number: invoiceNumber,
                  customer_name,
                  total_amount: totalAmount,
                  created_at: new Date().toISOString(),
                });
              }
            }
          );
        });
      }
    );
  });
});

// Add invoice update route
app.put('/api/invoices/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { customer_name, customer_phone, customer_email, payment_method } = req.body;
  if (!customer_name) return res.status(400).json({ error: 'Customer name required' });
  db.run(
    `UPDATE invoices SET customer_name=?, customer_phone=?, customer_email=?, payment_method=? WHERE id=?`,
    [customer_name, customer_phone || '', customer_email || '', payment_method || 'Cash', id],
    function(err) {
      if (err) return res.status(500).json({ error: 'Failed to update invoice' });
      if (this.changes === 0) return res.status(404).json({ error: 'Invoice not found' });
      logActivity(req.user.id, 'EDIT_INVOICE', `Updated invoice id: ${id}`);
      res.json({ success: true });
    }
  );
});

// Delete invoice
app.delete('/api/invoices/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.serialize(() => {
    db.run(`DELETE FROM invoice_items WHERE invoice_id=?`, [id]);
    db.run(`DELETE FROM invoices WHERE id=?`, [id], function(err) {
      if (err) return res.status(500).json({ error: 'Failed to delete invoice' });
      if (this.changes === 0) return res.status(404).json({ error: 'Invoice not found' });
      logActivity(req.user.id, 'DELETE_INVOICE', `Deleted invoice id: ${id}`);
      res.json({ success: true });
    });
  });
});

// Get all invoices
app.get('/api/invoices', authenticateToken, (req, res) => {
  db.all(
    `SELECT * FROM invoices ORDER BY created_at DESC`,
    (err, invoices) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json(invoices);
    }
  );
});

// Get invoice details with items
app.get('/api/invoices/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.get(`SELECT * FROM invoices WHERE id = ?`, [id], (err, invoice) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    db.all(`SELECT * FROM invoice_items WHERE invoice_id = ?`, [id], (err, items) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ ...invoice, items });
    });
  });
});

// Generate PDF invoice
app.get('/api/invoices/:id/pdf', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.get(`SELECT * FROM invoices WHERE id = ?`, [id], (err, invoice) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    db.all(`SELECT * FROM invoice_items WHERE invoice_id = ?`, [id], (err, items) => {
      if (err) return res.status(500).json({ error: 'Database error' });

      const doc = new PDFDocument({ margin: 0, size: 'A4' });
      const filename = `invoice-${invoice.invoice_number}.pdf`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      doc.pipe(res);

      const W = 595.28; // A4 width in points
      const margin = 40;

      // ── HEADER BAND ──────────────────────────────────────────────
      // Deep purple gradient background (simulated with filled rect)
      doc.rect(0, 0, W, 160).fill('#1a1a2e');
      // Accent strip
      doc.rect(0, 155, W, 5).fill('#6c63ff');

      // Decorative circles
      doc.circle(W - 60, 30, 80).fillOpacity(0.06).fill('#ffffff');
      doc.circle(W - 20, 120, 50).fillOpacity(0.04).fill('#ffffff');
      doc.fillOpacity(1);

      // ── BUTTERFLY LOGO (SVG-like using PDFKit shapes) ────────────
      const lx = margin + 5;
      const ly = 28;
      const s  = 0.55; // scale

      // Red petal (top-right)
      doc.save();
      doc.translate(lx + 50 * s, ly + 28 * s);
      doc.rotate(-15, { origin: [0, 0] });
      doc.ellipse(0, 0, 18 * s, 28 * s).fill('#ff6b6b');
      doc.restore();

      // Yellow petal (left)
      doc.save();
      doc.translate(lx + 37 * s, ly + 52 * s);
      doc.rotate(10, { origin: [0, 0] });
      doc.ellipse(0, 0, 22 * s, 15 * s).fill('#ffd93d');
      doc.restore();

      // Blue petal (bottom-left)
      doc.save();
      doc.translate(lx + 37 * s, ly + 70 * s);
      doc.rotate(-5, { origin: [0, 0] });
      doc.ellipse(0, 0, 15 * s, 11 * s).fill('#4d96ff');
      doc.restore();

      // Green petal (bottom-right)
      doc.save();
      doc.translate(lx + 53 * s, ly + 70 * s);
      doc.rotate(10, { origin: [0, 0] });
      doc.ellipse(0, 0, 11 * s, 9 * s).fill('#6bcf7f');
      doc.restore();

      // Stem
      doc.moveTo(lx + 50 * s, ly + 8 * s)
         .lineTo(lx + 50 * s, ly + 82 * s)
         .strokeColor('rgba(255,255,255,0.5)').lineWidth(1.5).stroke();

      // ── SHOP NAME & TAGLINE ──────────────────────────────────────
      const textX = lx + 70;
      doc.fillColor('white')
         .font('Helvetica-Bold').fontSize(28)
         .text('Look @ me', textX, 38, { lineBreak: false });

      doc.fillColor('rgba(255,255,255,0.55)')
         .font('Helvetica').fontSize(11)
         .text('Professional Billing System', textX, 72, { lineBreak: false });

      // ── INVOICE BADGE (top-right) ────────────────────────────────
      const badgeX = W - margin - 130;
      doc.roundedRect(badgeX, 30, 130, 36, 8).fill('#6c63ff');
      doc.fillColor('white').font('Helvetica-Bold').fontSize(14)
         .text('INVOICE', badgeX, 42, { width: 130, align: 'center', lineBreak: false });

      // Invoice number & date below badge
      doc.fillColor('rgba(255,255,255,0.75)').font('Helvetica').fontSize(9)
         .text(invoice.invoice_number, badgeX, 76, { width: 130, align: 'center', lineBreak: false });
      doc.fillColor('rgba(255,255,255,0.55)').fontSize(8)
         .text(new Date(invoice.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
               badgeX, 90, { width: 130, align: 'center', lineBreak: false });

      // ── BILL TO / INVOICE INFO SECTION ───────────────────────────
      const infoY = 175;

      // Left: Bill To
      doc.roundedRect(margin, infoY, 240, 110, 10).fill('#f8f9fc');
      doc.fillColor('#6c63ff').font('Helvetica-Bold').fontSize(8)
         .text('BILL TO', margin + 16, infoY + 14, { lineBreak: false });
      doc.moveTo(margin + 16, infoY + 24).lineTo(margin + 60, infoY + 24)
         .strokeColor('#6c63ff').lineWidth(1.5).stroke();

      doc.fillColor('#1a1a2e').font('Helvetica-Bold').fontSize(13)
         .text(invoice.customer_name, margin + 16, infoY + 32, { width: 210, lineBreak: false });
      doc.fillColor('#6b7280').font('Helvetica').fontSize(9);
      let billY = infoY + 50;
      if (invoice.customer_phone) {
        doc.text(`📞  ${invoice.customer_phone}`, margin + 16, billY, { lineBreak: false });
        billY += 14;
      }
      if (invoice.customer_email) {
        doc.text(`✉   ${invoice.customer_email}`, margin + 16, billY, { lineBreak: false });
        billY += 14;
      }

      // Right: Invoice Details
      const detailX = W - margin - 240;
      doc.roundedRect(detailX, infoY, 240, 110, 10).fill('#f8f9fc');
      doc.fillColor('#6c63ff').font('Helvetica-Bold').fontSize(8)
         .text('INVOICE DETAILS', detailX + 16, infoY + 14, { lineBreak: false });
      doc.moveTo(detailX + 16, infoY + 24).lineTo(detailX + 100, infoY + 24)
         .strokeColor('#6c63ff').lineWidth(1.5).stroke();

      const details = [
        ['Invoice No.', invoice.invoice_number],
        ['Date',        new Date(invoice.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })],
        ['Payment',     invoice.payment_method],
        ['Status',      'PAID'],
      ];
      details.forEach(([label, value], i) => {
        const dy = infoY + 32 + i * 17;
        doc.fillColor('#9ca3af').font('Helvetica').fontSize(8).text(label, detailX + 16, dy, { lineBreak: false });
        doc.fillColor('#1a1a2e').font('Helvetica-Bold').fontSize(9)
           .text(value, detailX + 100, dy, { lineBreak: false });
      });

      // ── ITEMS TABLE ───────────────────────────────────────────────
      const tableY = infoY + 125;

      // Table header
      doc.rect(margin, tableY, W - margin * 2, 28).fill('#1a1a2e');
      const cols = { item: margin + 12, qty: margin + 260, unit: margin + 330, total: margin + 420 };
      const headers = [['ITEM DESCRIPTION', cols.item], ['QTY', cols.qty], ['UNIT PRICE', cols.unit], ['TOTAL', cols.total]];
      headers.forEach(([h, x]) => {
        doc.fillColor('white').font('Helvetica-Bold').fontSize(8)
           .text(h, x, tableY + 10, { lineBreak: false });
      });

      // Table rows
      let rowY = tableY + 28;
      items.forEach((item, idx) => {
        const rowBg = idx % 2 === 0 ? '#ffffff' : '#f8f9fc';
        doc.rect(margin, rowY, W - margin * 2, 26).fill(rowBg);

        // Left accent bar on hover rows
        if (idx % 2 !== 0) {
          doc.rect(margin, rowY, 3, 26).fill('#6c63ff');
        }

        doc.fillColor('#1a1a2e').font('Helvetica-Bold').fontSize(9)
           .text(item.product_name, cols.item, rowY + 8, { width: 230, lineBreak: false });
        doc.fillColor('#6b7280').font('Helvetica').fontSize(9)
           .text(item.quantity.toString(), cols.qty, rowY + 8, { lineBreak: false });
        doc.text(`Rs. ${item.unit_price.toLocaleString('en-IN')}`, cols.unit, rowY + 8, { lineBreak: false });
        doc.fillColor('#1a1a2e').font('Helvetica-Bold').fontSize(9)
           .text(`Rs. ${item.total_price.toLocaleString('en-IN')}`, cols.total, rowY + 8, { lineBreak: false });

        rowY += 26;
      });

      // Table bottom border
      doc.rect(margin, rowY, W - margin * 2, 1).fill('#e5e7eb');
      rowY += 16;

      // ── TOTALS SECTION ────────────────────────────────────────────
      const totalsX = W - margin - 220;
      const subtotal = items.reduce((s, i) => s + i.total_price, 0);

      const totalsRows = [
        ['Subtotal', subtotal],
        ...(invoice.tax_amount > 0 ? [['Tax', invoice.tax_amount]] : []),
        ...(invoice.discount_amount > 0 ? [['Discount', -invoice.discount_amount]] : []),
      ];

      totalsRows.forEach(([label, amount]) => {
        doc.fillColor('#6b7280').font('Helvetica').fontSize(9)
           .text(label, totalsX, rowY, { lineBreak: false });
        doc.fillColor('#1a1a2e').font('Helvetica-Bold').fontSize(9)
           .text(`Rs. ${Math.abs(amount).toLocaleString('en-IN')}`, totalsX + 120, rowY, { lineBreak: false });
        rowY += 16;
      });

      // Total box
      rowY += 4;
      doc.roundedRect(totalsX - 12, rowY, 232, 38, 8).fill('#6c63ff');
      doc.fillColor('rgba(255,255,255,0.8)').font('Helvetica').fontSize(10)
         .text('TOTAL AMOUNT', totalsX, rowY + 8, { lineBreak: false });
      doc.fillColor('white').font('Helvetica-Bold').fontSize(14)
         .text(`Rs. ${invoice.total_amount.toLocaleString('en-IN')}`, totalsX + 100, rowY + 6, { lineBreak: false });

      rowY += 60;

      // ── PAYMENT METHOD BADGE ──────────────────────────────────────
      doc.roundedRect(margin, rowY - 10, 120, 26, 6).fill('rgba(107,207,127,0.15)');
      doc.fillColor('#6bcf7f').font('Helvetica-Bold').fontSize(9)
         .text(`✓  Paid via ${invoice.payment_method}`, margin + 10, rowY - 3, { lineBreak: false });

      // ── FOOTER ────────────────────────────────────────────────────
      const footerY = 780;
      doc.rect(0, footerY, W, 62).fill('#1a1a2e');
      doc.rect(0, footerY, W, 3).fill('#6c63ff');

      // Footer butterfly (small)
      const fx = margin;
      const fy = footerY + 12;
      const fs = 0.22;
      doc.save();
      doc.translate(fx + 50 * fs, fy + 28 * fs).rotate(-15).ellipse(0, 0, 18 * fs, 28 * fs).fill('#ff6b6b');
      doc.restore();
      doc.save();
      doc.translate(fx + 37 * fs, fy + 52 * fs).rotate(10).ellipse(0, 0, 22 * fs, 15 * fs).fill('#ffd93d');
      doc.restore();
      doc.save();
      doc.translate(fx + 37 * fs, fy + 70 * fs).rotate(-5).ellipse(0, 0, 15 * fs, 11 * fs).fill('#4d96ff');
      doc.restore();
      doc.save();
      doc.translate(fx + 53 * fs, fy + 70 * fs).rotate(10).ellipse(0, 0, 11 * fs, 9 * fs).fill('#6bcf7f');
      doc.restore();

      doc.fillColor('white').font('Helvetica-Bold').fontSize(10)
         .text('Look @ me', fx + 22, footerY + 16, { lineBreak: false });
      doc.fillColor('rgba(255,255,255,0.45)').font('Helvetica').fontSize(8)
         .text('Thank you for your business!', fx + 22, footerY + 30, { lineBreak: false });

      doc.fillColor('rgba(255,255,255,0.35)').font('Helvetica').fontSize(7)
         .text('This is a computer-generated invoice and does not require a signature.',
               0, footerY + 46, { width: W, align: 'center', lineBreak: false });

      doc.end();
      logActivity(req.user.id, 'DOWNLOAD_PDF', `Downloaded PDF for invoice: ${invoice.invoice_number}`);
    });
  });
});

// ==================== DASHBOARD ROUTES ====================

// Get dashboard stats
app.get('/api/dashboard/stats', authenticateToken, (req, res) => {
  const today = new Date().toISOString().slice(0, 10);

  db.get(
    `SELECT COUNT(*) as total_invoices, SUM(total_amount) as total_revenue FROM invoices WHERE created_at LIKE ?`,
    [`${today}%`],
    (err, row) => {
      if (err) return res.status(500).json({ error: 'Database error' });

      db.get(`SELECT COUNT(*) as total_products FROM products`, (err, products) => {
        if (err) return res.status(500).json({ error: 'Database error' });

        res.json({
          today_invoices: row?.total_invoices || 0,
          today_revenue: row?.total_revenue || 0,
          total_products: products?.total_products || 0,
        });
      });
    }
  );
});

// Get activity logs
app.get('/api/activity-logs', authenticateToken, (req, res) => {
  db.all(
    `SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 50`,
    (err, logs) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json(logs);
    }
  );
});

// ==================== WHATSAPP PDF ROUTE ====================
// Generates PDF and returns it as base64 so frontend can trigger download + WhatsApp share
app.get('/api/invoices/:id/pdf-base64', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.get(`SELECT * FROM invoices WHERE id = ?`, [id], (err, invoice) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    db.all(`SELECT * FROM invoice_items WHERE invoice_id = ?`, [id], (err, items) => {
      if (err) return res.status(500).json({ error: 'Database error' });

      const doc = new PDFDocument({ margin: 0, size: 'A4' });
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        const base64 = pdfBuffer.toString('base64');
        res.json({
          base64,
          filename: `invoice-${invoice.invoice_number}.pdf`,
          invoice_number: invoice.invoice_number,
          mimeType: 'application/pdf',
        });
      });

      // Reuse same PDF generation logic
      const W = 595.28;
      const margin = 40;
      doc.rect(0, 0, W, 160).fill('#1a1a2e');
      doc.rect(0, 155, W, 5).fill('#6c63ff');
      doc.circle(W - 60, 30, 80).fillOpacity(0.06).fill('#ffffff');
      doc.circle(W - 20, 120, 50).fillOpacity(0.04).fill('#ffffff');
      doc.fillOpacity(1);
      const lx = margin + 5, ly = 28, s = 0.55;
      doc.save(); doc.translate(lx+50*s,ly+28*s); doc.rotate(-15,{origin:[0,0]}); doc.ellipse(0,0,18*s,28*s).fill('#ff6b6b'); doc.restore();
      doc.save(); doc.translate(lx+37*s,ly+52*s); doc.rotate(10,{origin:[0,0]}); doc.ellipse(0,0,22*s,15*s).fill('#ffd93d'); doc.restore();
      doc.save(); doc.translate(lx+37*s,ly+70*s); doc.rotate(-5,{origin:[0,0]}); doc.ellipse(0,0,15*s,11*s).fill('#4d96ff'); doc.restore();
      doc.save(); doc.translate(lx+53*s,ly+70*s); doc.rotate(10,{origin:[0,0]}); doc.ellipse(0,0,11*s,9*s).fill('#6bcf7f'); doc.restore();
      doc.moveTo(lx+50*s,ly+8*s).lineTo(lx+50*s,ly+82*s).strokeColor('rgba(255,255,255,0.5)').lineWidth(1.5).stroke();
      const textX = lx+70;
      doc.fillColor('white').font('Helvetica-Bold').fontSize(28).text('Look @ me',textX,38,{lineBreak:false});
      doc.fillColor('rgba(255,255,255,0.55)').font('Helvetica').fontSize(11).text('Professional Billing System',textX,72,{lineBreak:false});
      const badgeX = W-margin-130;
      doc.roundedRect(badgeX,30,130,36,8).fill('#6c63ff');
      doc.fillColor('white').font('Helvetica-Bold').fontSize(14).text('INVOICE',badgeX,42,{width:130,align:'center',lineBreak:false});
      doc.fillColor('rgba(255,255,255,0.75)').font('Helvetica').fontSize(9).text(invoice.invoice_number,badgeX,76,{width:130,align:'center',lineBreak:false});
      doc.fillColor('rgba(255,255,255,0.55)').fontSize(8).text(new Date(invoice.created_at).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}),badgeX,90,{width:130,align:'center',lineBreak:false});
      const infoY=175;
      doc.roundedRect(margin,infoY,240,110,10).fill('#f8f9fc');
      doc.fillColor('#6c63ff').font('Helvetica-Bold').fontSize(8).text('BILL TO',margin+16,infoY+14,{lineBreak:false});
      doc.moveTo(margin+16,infoY+24).lineTo(margin+60,infoY+24).strokeColor('#6c63ff').lineWidth(1.5).stroke();
      doc.fillColor('#1a1a2e').font('Helvetica-Bold').fontSize(13).text(invoice.customer_name,margin+16,infoY+32,{width:210,lineBreak:false});
      doc.fillColor('#6b7280').font('Helvetica').fontSize(9);
      let billY=infoY+50;
      if(invoice.customer_phone){doc.text(`Phone: ${invoice.customer_phone}`,margin+16,billY,{lineBreak:false});billY+=14;}
      if(invoice.customer_email){doc.text(`Email: ${invoice.customer_email}`,margin+16,billY,{lineBreak:false});billY+=14;}
      const detailX=W-margin-240;
      doc.roundedRect(detailX,infoY,240,110,10).fill('#f8f9fc');
      doc.fillColor('#6c63ff').font('Helvetica-Bold').fontSize(8).text('INVOICE DETAILS',detailX+16,infoY+14,{lineBreak:false});
      doc.moveTo(detailX+16,infoY+24).lineTo(detailX+100,infoY+24).strokeColor('#6c63ff').lineWidth(1.5).stroke();
      [['Invoice No.',invoice.invoice_number],['Date',new Date(invoice.created_at).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})],['Payment',invoice.payment_method],['Status','PAID']].forEach(([label,value],i)=>{
        const dy=infoY+32+i*17;
        doc.fillColor('#9ca3af').font('Helvetica').fontSize(8).text(label,detailX+16,dy,{lineBreak:false});
        doc.fillColor('#1a1a2e').font('Helvetica-Bold').fontSize(9).text(value,detailX+100,dy,{lineBreak:false});
      });
      const tableY=infoY+125;
      doc.rect(margin,tableY,W-margin*2,28).fill('#1a1a2e');
      const cols={item:margin+12,qty:margin+260,unit:margin+330,total:margin+420};
      [['ITEM DESCRIPTION',cols.item],['QTY',cols.qty],['UNIT PRICE',cols.unit],['TOTAL',cols.total]].forEach(([h,x])=>{
        doc.fillColor('white').font('Helvetica-Bold').fontSize(8).text(h,x,tableY+10,{lineBreak:false});
      });
      let rowY=tableY+28;
      items.forEach((item,idx)=>{
        doc.rect(margin,rowY,W-margin*2,26).fill(idx%2===0?'#ffffff':'#f8f9fc');
        if(idx%2!==0)doc.rect(margin,rowY,3,26).fill('#6c63ff');
        doc.fillColor('#1a1a2e').font('Helvetica-Bold').fontSize(9).text(item.product_name,cols.item,rowY+8,{width:230,lineBreak:false});
        doc.fillColor('#6b7280').font('Helvetica').fontSize(9).text(item.quantity.toString(),cols.qty,rowY+8,{lineBreak:false});
        doc.text(`Rs. ${item.unit_price.toLocaleString('en-IN')}`,cols.unit,rowY+8,{lineBreak:false});
        doc.fillColor('#1a1a2e').font('Helvetica-Bold').fontSize(9).text(`Rs. ${item.total_price.toLocaleString('en-IN')}`,cols.total,rowY+8,{lineBreak:false});
        rowY+=26;
      });
      doc.rect(margin,rowY,W-margin*2,1).fill('#e5e7eb');
      rowY+=16;
      const totalsX=W-margin-220;
      const subtotal=items.reduce((s,i)=>s+i.total_price,0);
      [['Subtotal',subtotal],...(invoice.tax_amount>0?[['Tax',invoice.tax_amount]]:[]),(invoice.discount_amount>0?[['Discount',-invoice.discount_amount]]:[])].filter(r=>r.length).forEach(([label,amount])=>{
        doc.fillColor('#6b7280').font('Helvetica').fontSize(9).text(label,totalsX,rowY,{lineBreak:false});
        doc.fillColor('#1a1a2e').font('Helvetica-Bold').fontSize(9).text(`Rs. ${Math.abs(amount).toLocaleString('en-IN')}`,totalsX+120,rowY,{lineBreak:false});
        rowY+=16;
      });
      rowY+=4;
      doc.roundedRect(totalsX-12,rowY,232,38,8).fill('#6c63ff');
      doc.fillColor('rgba(255,255,255,0.8)').font('Helvetica').fontSize(10).text('TOTAL AMOUNT',totalsX,rowY+8,{lineBreak:false});
      doc.fillColor('white').font('Helvetica-Bold').fontSize(14).text(`Rs. ${invoice.total_amount.toLocaleString('en-IN')}`,totalsX+100,rowY+6,{lineBreak:false});
      rowY+=60;
      doc.roundedRect(margin,rowY-10,140,26,6).fill('rgba(107,207,127,0.15)');
      doc.fillColor('#6bcf7f').font('Helvetica-Bold').fontSize(9).text(`Paid via ${invoice.payment_method}`,margin+10,rowY-3,{lineBreak:false});
      const footerY=780;
      doc.rect(0,footerY,W,62).fill('#1a1a2e');
      doc.rect(0,footerY,W,3).fill('#6c63ff');
      const fx=margin,fy=footerY+12,fs=0.22;
      doc.save();doc.translate(fx+50*fs,fy+28*fs).rotate(-15).ellipse(0,0,18*fs,28*fs).fill('#ff6b6b');doc.restore();
      doc.save();doc.translate(fx+37*fs,fy+52*fs).rotate(10).ellipse(0,0,22*fs,15*fs).fill('#ffd93d');doc.restore();
      doc.save();doc.translate(fx+37*fs,fy+70*fs).rotate(-5).ellipse(0,0,15*fs,11*fs).fill('#4d96ff');doc.restore();
      doc.save();doc.translate(fx+53*fs,fy+70*fs).rotate(10).ellipse(0,0,11*fs,9*fs).fill('#6bcf7f');doc.restore();
      doc.fillColor('white').font('Helvetica-Bold').fontSize(10).text('Look @ me',fx+22,footerY+16,{lineBreak:false});
      doc.fillColor('rgba(255,255,255,0.45)').font('Helvetica').fontSize(8).text('Thank you for your business!',fx+22,footerY+30,{lineBreak:false});
      doc.fillColor('rgba(255,255,255,0.35)').font('Helvetica').fontSize(7).text('This is a computer-generated invoice.',0,footerY+46,{width:W,align:'center',lineBreak:false});
      doc.end();
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
