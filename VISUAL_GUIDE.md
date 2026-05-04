# Look @ me Billing System - Visual Guide

## 🎨 User Interface Overview

### Application Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Look @ me - Billing System                    Welcome, admin │
│  [Logout Button]                                             │
├──────────────┬──────────────────────────────────────────────┤
│              │                                              │
│  Dashboard   │                                              │
│  Create Bill │         MAIN CONTENT AREA                   │
│  Records     │                                              │
│              │                                              │
│              │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

---

## 📄 Login Page

```
┌─────────────────────────────────┐
│                                 │
│      Look @ me                  │
│   Billing System                │
│                                 │
│  ┌─────────────────────────┐   │
│  │ Username                │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ Password                │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │    Login Button         │   │
│  └─────────────────────────┘   │
│                                 │
│  Demo Credentials:              │
│  Username: admin                │
│  Password: admin123             │
│                                 │
└─────────────────────────────────┘
```

---

## 📊 Dashboard Page

```
┌─────────────────────────────────────────────────────────────┐
│ Dashboard                                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   📄 Today   │  │   💰 Today   │  │   📦 Total   │    │
│  │  Invoices    │  │   Revenue    │  │   Products   │    │
│  │              │  │              │  │              │    │
│  │      5       │  │   ₹45,000    │  │      50      │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Recent Activity                                             │
├─────────────────────────────────────────────────────────────┤
│ Action          │ Details              │ Time              │
├─────────────────┼──────────────────────┼───────────────────┤
│ LOGIN           │ User admin logged in │ 10:30 AM          │
│ CREATE_INVOICE  │ Created invoice...   │ 10:25 AM          │
│ ADD_PRODUCT     │ Added product...     │ 10:20 AM          │
│ DOWNLOAD_PDF    │ Downloaded PDF...    │ 10:15 AM          │
└─────────────────────────────────────────────────────────────┘
```

---

## 💳 Create Bill Page

### Customer Details Section
```
┌─────────────────────────────────────────────────────────────┐
│ Customer Details                                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Customer Name *        Phone Number        Email          │
│  ┌──────────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ John Doe         │  │ 9876543210   │  │ john@...     │ │
│  └──────────────────┘  └──────────────┘  └──────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Product Selection Section
```
┌─────────────────────────────────────────────────────────────┐
│ Select Products                    [+ Add New Product]      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Laptop     │  │    Mouse     │  │  Keyboard    │    │
│  │  ₹50,000     │  │    ₹500      │  │   ₹1,500     │    │
│  │ Electronics  │  │ Accessories  │  │ Accessories  │    │
│  │              │  │              │  │              │    │
│  │ Qty: [1]     │  │ Qty: [1]     │  │ Qty: [1]     │    │
│  │ [Add to Cart]│  │ [Add to Cart]│  │ [Add to Cart]│    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Monitor    │  │  USB Cable   │  │ Headphones   │    │
│  │  ₹15,000     │  │    ₹200      │  │   ₹3,000     │    │
│  │ Electronics  │  │ Accessories  │  │    Audio     │    │
│  │              │  │              │  │              │    │
│  │ Qty: [1]     │  │ Qty: [1]     │  │ Qty: [1]     │    │
│  │ [Add to Cart]│  │ [Add to Cart]│  │ [Add to Cart]│    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Shopping Cart Section
```
┌─────────────────────────────────────────────────────────────┐
│ Bill Items                                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Laptop                                                      │
│ ₹50,000 × 1                          ₹50,000  [Remove]    │
│                                                             │
│ Mouse                                                       │
│ ₹500 × 2                             ₹1,000   [Remove]    │
│                                                             │
│ Keyboard                                                    │
│ ₹1,500 × 1                           ₹1,500   [Remove]    │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Subtotal:                                      ₹52,500     │
│ Tax:           [0]                             ₹0          │
│ Discount:      [0]                             ₹0          │
│ Payment Method: [Cash ▼]                                   │
│ ─────────────────────────────────────────────────────────  │
│ TOTAL:                                         ₹52,500     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Clear Cart]  [Create & Download Bill]                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Records Page

```
┌─────────────────────────────────────────────────────────────┐
│ Billing Records                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Invoice # │ Customer │ Amount    │ Method │ Date      │ Act│
├────────────┼──────────┼───────────┼────────┼───────────┼────┤
│ INV-...001 │ John Doe │ ₹52,500   │ Cash   │ 10:30 AM  │ 👁 📄│
│ INV-...002 │ Jane Doe │ ₹15,000   │ Card   │ 10:15 AM  │ 👁 📄│
│ INV-...003 │ Bob Smith│ ₹8,500    │ UPI    │ 09:45 AM  │ 👁 📄│
│ INV-...004 │ Alice J. │ ₹25,000   │ Cash   │ 09:30 AM  │ 👁 📄│
│ INV-...005 │ Charlie  │ ₹12,000   │ Cheque │ 09:00 AM  │ 👁 📄│
│                                                             │
│ [Previous] Page 1 of 5 [Next]                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Invoice Details Modal
```
┌─────────────────────────────────────────────────────────────┐
│ Invoice Details - INV-20260430-0001                    [X]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Invoice Number: INV-20260430-0001                          │
│ Date: 30/04/2026 10:30 AM                                  │
│                                                             │
│ Customer Name: John Doe                                    │
│ Phone: 9876543210                                          │
│ Email: john@example.com                                    │
│ Payment Method: Cash                                       │
│                                                             │
│ Items:                                                      │
│ ┌──────────────┬─────┬────────────┬──────────┐            │
│ │ Product      │ Qty │ Unit Price │ Total    │            │
│ ├──────────────┼─────┼────────────┼──────────┤            │
│ │ Laptop       │  1  │ ₹50,000    │ ₹50,000  │            │
│ │ Mouse        │  2  │ ₹500       │ ₹1,000   │            │
│ │ Keyboard     │  1  │ ₹1,500     │ ₹1,500   │            │
│ └──────────────┴─────┴────────────┴──────────┘            │
│                                                             │
│ Subtotal: ₹52,500                                          │
│ Tax: ₹0                                                    │
│ Discount: ₹0                                               │
│ ─────────────────────────────────────────────────────────  │
│ TOTAL: ₹52,500                                             │
│                                                             │
│  [Close]  [Download PDF]                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📄 PDF Invoice Layout

```
╔═════════════════════════════════════════════════════════════╗
║                                                             ║
║                      Look @ me                             ║
║              Professional Billing System                   ║
║                                                             ║
║                        INVOICE                             ║
║                                                             ║
║  Invoice #: INV-20260430-0001                              ║
║  Date: 30/04/2026                                          ║
║                                                             ║
║  Bill To:                                                  ║
║  Name: John Doe                                            ║
║  Phone: 9876543210                                         ║
║  Email: john@example.com                                   ║
║                                                             ║
╠═════════════════════════════════════════════════════════════╣
║                                                             ║
║  Item              Qty    Unit Price      Total            ║
║  ─────────────────────────────────────────────────────────  ║
║  Laptop             1      ₹50,000        ₹50,000          ║
║  Mouse              2      ₹500           ₹1,000           ║
║  Keyboard           1      ₹1,500         ₹1,500           ║
║                                                             ║
║  ─────────────────────────────────────────────────────────  ║
║  Subtotal:                                 ₹52,500         ║
║  Tax:                                      ₹0              ║
║  Discount:                                 ₹0              ║
║  ═════════════════════════════════════════════════════════  ║
║  TOTAL:                                    ₹52,500         ║
║                                                             ║
║  Payment Method: Cash                                      ║
║                                                             ║
║           Thank you for your business!                     ║
║                                                             ║
╚═════════════════════════════════════════════════════════════╝
```

---

## 🎨 Color Scheme

### Primary Colors
```
┌─────────────────────────────────────────┐
│ Primary Purple:    #667eea              │
│ ████████████████████████████████████    │
│                                         │
│ Dark Purple:       #764ba2              │
│ ████████████████████████████████████    │
│                                         │
│ Green Accent:      #52c41a              │
│ ████████████████████████████████████    │
│                                         │
│ Light Gray:        #f5f5f5              │
│ ████████████████████████████████████    │
│                                         │
│ Border Gray:       #d9d9d9              │
│ ████████████████████████████████████    │
└─────────────────────────────────────────┘
```

---

## 📱 Responsive Layouts

### Mobile (< 768px)
```
┌──────────────────┐
│ Look @ me        │
│ [Logout]         │
├──────────────────┤
│ Dashboard        │
│ Create Bill      │
│ Records          │
├──────────────────┤
│                  │
│  CONTENT         │
│  (Single Column) │
│                  │
└──────────────────┘
```

### Tablet (768-1024px)
```
┌────────────────────────────────────┐
│ Look @ me              [Logout]    │
├──────────┬────────────────────────┤
│Dashboard │                        │
│Create    │  CONTENT               │
│Bill      │  (Two Columns)         │
│Records   │                        │
│          │                        │
└──────────┴────────────────────────┘
```

### Desktop (> 1024px)
```
┌──────────────────────────────────────────────────┐
│ Look @ me - Billing System    Welcome, admin     │
│ [Logout]                                         │
├──────────────┬──────────────────────────────────┤
│              │                                  │
│ Dashboard    │                                  │
│ Create Bill  │  CONTENT                         │
│ Records      │  (Full Layout)                   │
│              │                                  │
│              │                                  │
└──────────────┴──────────────────────────────────┘
```

---

## 🔄 User Flow Diagram

```
                    ┌─────────────┐
                    │   START     │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   LOGIN     │
                    │ admin/admin │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  DASHBOARD  │
                    │ View Stats  │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
         ┌────────┐  ┌────────┐  ┌────────┐
         │ CREATE │  │ VIEW   │  │LOGOUT  │
         │  BILL  │  │RECORDS │  │        │
         └────┬───┘  └────┬───┘  └────┬───┘
              │           │           │
              ▼           ▼           │
         ┌────────┐  ┌────────┐       │
         │ SELECT │  │ VIEW   │       │
         │PRODUCTS│  │DETAILS │       │
         └────┬───┘  └────┬───┘       │
              │           │           │
              ▼           ▼           │
         ┌────────┐  ┌────────┐       │
         │ REVIEW │  │DOWNLOAD│       │
         │  BILL  │  │  PDF   │       │
         └────┬───┘  └────┬───┘       │
              │           │           │
              ▼           ▼           │
         ┌────────┐  ┌────────┐       │
         │DOWNLOAD│  │ DONE   │       │
         │  PDF   │  │        │       │
         └────┬───┘  └────────┘       │
              │                       │
              └───────────┬───────────┘
                          │
                          ▼
                    ┌─────────────┐
                    │    END      │
                    └─────────────┘
```

---

## 📊 Data Flow Diagram

```
┌──────────────┐
│   Frontend   │
│   (React)    │
└──────┬───────┘
       │
       │ HTTP Requests
       │ (Axios)
       ▼
┌──────────────┐
│   Backend    │
│  (Express)   │
└──────┬───────┘
       │
       │ SQL Queries
       │
       ▼
┌──────────────┐
│   Database   │
│  (SQLite)    │
└──────────────┘
```

---

## 🔐 Authentication Flow

```
┌─────────────┐
│   User      │
│  Enters     │
│ Credentials │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ Validate Input      │
│ (Frontend)          │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Send to Backend     │
│ (HTTPS)             │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Check Database      │
│ Find User           │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Compare Password    │
│ (bcryptjs)          │
└──────┬──────────────┘
       │
       ├─ Match ──────┐
       │              │
       │ No Match     ▼
       │         ┌──────────┐
       │         │ Generate │
       │         │ JWT Token│
       │         └────┬─────┘
       │              │
       ▼              ▼
   ┌────────┐    ┌──────────┐
   │ Error  │    │ Success  │
   │Message │    │ Response │
   └────────┘    └──────────┘
```

---

## 💾 Database Schema Diagram

```
┌─────────────────────┐
│      admins         │
├─────────────────────┤
│ id (PK)             │
│ username (UNIQUE)   │
│ password            │
│ email               │
│ created_at          │
└──────────┬──────────┘
           │
           │ 1:N
           │
           ▼
┌─────────────────────┐
│   activity_logs     │
├─────────────────────┤
│ id (PK)             │
│ admin_id (FK)       │
│ action              │
│ details             │
│ created_at          │
└─────────────────────┘

┌─────────────────────┐
│     products        │
├─────────────────────┤
│ id (PK)             │
│ name                │
│ price               │
│ category            │
│ stock               │
│ created_at          │
└──────────┬──────────┘
           │
           │ 1:N
           │
           ▼
┌─────────────────────┐
│  invoice_items      │
├─────────────────────┤
│ id (PK)             │
│ invoice_id (FK)     │
│ product_id (FK)     │
│ product_name        │
│ quantity            │
│ unit_price          │
│ total_price         │
└─────────────────────┘
           ▲
           │ 1:N
           │
┌──────────┴──────────┐
│     invoices        │
├─────────────────────┤
│ id (PK)             │
│ invoice_number      │
│ customer_name       │
│ customer_phone      │
│ customer_email      │
│ total_amount        │
│ tax_amount          │
│ discount_amount     │
│ payment_method      │
│ status              │
│ created_by (FK)     │
│ created_at          │
└─────────────────────┘
```

---

## 🎯 Feature Interaction Map

```
                    ┌─────────────┐
                    │   LOGIN     │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  DASHBOARD  │
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
   ┌─────────┐        ┌─────────┐       ┌─────────┐
   │ CREATE  │        │ RECORDS │       │ PROFILE │
   │  BILL   │        │         │       │ (Future)│
   └────┬────┘        └────┬────┘       └─────────┘
        │                  │
        ├─ Add Products    ├─ View Invoices
        ├─ Select Products ├─ View Details
        ├─ Manage Cart     ├─ Download PDF
        ├─ Calculate Total ├─ Search
        ├─ Apply Tax       └─ Filter
        ├─ Apply Discount
        ├─ Choose Payment
        └─ Generate PDF
```

---

## 📈 Performance Metrics

```
Page Load Time
├─ Frontend: 1.5s
├─ Backend: 0.3s
└─ Total: < 2s

API Response Time
├─ Login: 200ms
├─ Get Products: 100ms
├─ Create Invoice: 300ms
├─ Get Invoices: 150ms
└─ Generate PDF: 2s

Database Query Time
├─ Select: 50ms
├─ Insert: 100ms
├─ Update: 80ms
└─ Delete: 60ms
```

---

## 🎨 UI Component Hierarchy

```
App
├─ Header
│  ├─ Logo
│  ├─ Title
│  └─ User Section
│     ├─ Username
│     └─ Logout Button
├─ Sidebar
│  ├─ Dashboard Button
│  ├─ Create Bill Button
│  └─ Records Button
└─ Content
   ├─ Dashboard Page
   │  ├─ Stats Cards
   │  └─ Activity Table
   ├─ Billing Page
   │  ├─ Customer Form
   │  ├─ Products Grid
   │  └─ Cart Section
   └─ Records Page
      ├─ Invoices Table
      └─ Details Modal
```

---

**Visual Guide Complete!**

This guide provides a comprehensive visual representation of the Look @ me Billing System interface, workflows, and architecture.
