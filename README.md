# Look @ me - Professional Billing & Invoice Generation System

A complete, production-ready billing and invoice generation system built with React, Node.js, and SQLite. Perfect for retail shops and businesses to manage daily billing operations.

## Features

### 🔐 Admin Authentication
- Secure login system with JWT tokens
- Session management
- Password hashing with bcrypt
- Activity logging

### 📄 Billing Module
- Create professional invoices with itemized products
- Customer details management
- Tax and discount calculations
- Multiple payment methods (Cash, Card, UPI, Cheque)
- Real-time cart management

### 📊 Dashboard
- Today's invoice count
- Daily revenue tracking
- Total products inventory
- Recent activity logs
- Real-time statistics

### 📋 Records Management
- Complete billing history
- Invoice search and filtering
- Detailed invoice view
- PDF download functionality
- Transaction tracking

### 🎨 Professional UI
- Modern, attractive design using Ant Design
- Responsive layout for all devices
- Intuitive navigation
- Professional color scheme (Purple & Blue gradient)
- Clean, organized interface

### 💾 Database
- SQLite database for reliable data storage
- Complete transaction history
- Product inventory management
- Admin activity tracking
- Timestamps for all operations

## Tech Stack

### Frontend
- React 18
- Vite (Fast build tool)
- Ant Design (UI Components)
- Axios (HTTP Client)
- CSS3 (Responsive Design)

### Backend
- Node.js & Express
- SQLite3 (Database)
- JWT (Authentication)
- bcryptjs (Password Hashing)
- PDFKit (PDF Generation)
- CORS (Cross-Origin Support)

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Setup Steps

1. **Navigate to project directory**
   ```bash
   cd billing-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the backend server** (in one terminal)
   ```bash
   node server.js
   ```
   Server will run on `http://localhost:5000`

4. **Start the frontend** (in another terminal)
   ```bash
   npm run dev
   ```
   Frontend will run on `http://localhost:5173` (or next available port)

## Default Credentials

- **Username:** `admin`
- **Password:** `admin123`

⚠️ **Important:** Change these credentials in production!

## Usage

### 1. Login
- Enter admin credentials
- Secure session is created

### 2. Create Bill
- Enter customer details (name, phone, email)
- Select products and quantities
- Add tax and discount if needed
- Choose payment method
- Click "Create & Download Bill"
- PDF is automatically generated and downloaded

### 3. View Records
- See all historical invoices
- View detailed invoice information
- Download PDF of any invoice
- Track payment methods and amounts

### 4. Dashboard
- Monitor today's sales
- Track revenue
- View recent activities
- Check product inventory

## Project Structure

```
billing-system/
├── src/
│   ├── pages/
│   │   ├── Login.jsx          # Login page
│   │   ├── Dashboard.jsx      # Dashboard with stats
│   │   ├── BillingModule.jsx  # Bill creation
│   │   └── Records.jsx        # Invoice records
│   ├── App.jsx                # Main app component
│   ├── App.css                # Styling
│   └── main.jsx               # Entry point
├── server.js                  # Express backend
├── billing.db                 # SQLite database (auto-created)
├── package.json               # Dependencies
├── vite.config.js             # Vite configuration
├── index.html                 # HTML template
└── README.md                  # This file
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Add new product

### Invoices
- `POST /api/invoices` - Create invoice
- `GET /api/invoices` - Get all invoices
- `GET /api/invoices/:id` - Get invoice details
- `GET /api/invoices/:id/pdf` - Download invoice PDF

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/activity-logs` - Get activity logs

## Database Schema

### admins
- id (UUID)
- username (unique)
- password (hashed)
- email
- created_at

### products
- id (UUID)
- name
- price
- category
- stock
- created_at

### invoices
- id (UUID)
- invoice_number (unique)
- customer_name
- customer_phone
- customer_email
- total_amount
- tax_amount
- discount_amount
- payment_method
- status
- created_by (FK to admins)
- created_at

### invoice_items
- id (UUID)
- invoice_id (FK)
- product_id (FK)
- product_name
- quantity
- unit_price
- total_price

### activity_logs
- id (UUID)
- admin_id (FK)
- action
- details
- created_at

## Features in Detail

### PDF Generation
- Professional invoice layout
- Shop name and branding
- Itemized product list
- Tax and discount calculations
- Payment method display
- Thank you message

### Security
- JWT token-based authentication
- Password hashing with bcrypt
- CORS protection
- Activity logging for audit trail
- Secure session management

### Data Validation
- Customer name validation
- Product price validation
- Quantity validation
- Email format validation
- Phone number validation

## Customization

### Change Shop Name
Edit `server.js` and `App.jsx` to change "Look @ me" to your shop name.

### Add More Products
Use the "Add New Product" button in the billing module or add directly to the database.

### Modify Colors
Edit `App.css` to change the color scheme:
- Primary: `#667eea` (Purple)
- Secondary: `#764ba2` (Dark Purple)
- Accent: `#52c41a` (Green)

### Add More Payment Methods
Edit the payment method select in `BillingModule.jsx`

## Troubleshooting

### Port Already in Use
If port 5000 is in use, change it in `.env` file:
```
PORT=5001
```

### Database Issues
Delete `billing.db` to reset the database (all data will be lost).

### CORS Errors
Ensure both frontend and backend are running on the correct ports.

### PDF Download Not Working
Check browser console for errors and ensure backend is running.

## Performance Optimization

- Lazy loading of components
- Efficient database queries
- Optimized PDF generation
- Responsive image handling
- Minified CSS and JavaScript

## Future Enhancements

- Multi-user support with different roles
- Inventory management
- Sales reports and analytics
- Email invoice delivery
- SMS notifications
- Barcode scanning
- Multiple shop support
- Cloud backup
- Mobile app

## License

This project is provided as-is for business use.

## Support

For issues or questions, please check the code comments or contact support.

---

**Built with ❤️ for "Look @ me" Shop**

Professional Billing System | Production Ready | Easy to Use
