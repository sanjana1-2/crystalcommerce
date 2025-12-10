# ShopKart - E-Commerce Platform

A full-stack e-commerce application like Flipkart built with React, Node.js, MongoDB, Tailwind CSS, and Razorpay payment integration.

## Features

- 🛒 Product browsing with categories and filters
- 🔍 Search functionality
- 🛍️ Shopping cart with quantity management
- 💳 **Razorpay Payment Integration** (Cards, UPI, Net Banking)
- 📦 Order placement and tracking
- 👤 User authentication (Register/Login)
- 💬 AI Chatbot for customer support
- 👨‍💼 **Full Admin Dashboard**
  - Dashboard with stats & revenue
  - Product management (Add/Edit/Delete)
  - Category management
  - Order management with status updates
  - User management with role assignment (Customer/Seller/Admin)
- 📱 Responsive design

## Tech Stack

**Frontend:** React, Tailwind CSS, React Router
**Backend:** Node.js, Express.js
**Database:** MongoDB
**Payment:** Razorpay
**AI:** OpenAI API (optional)

## Setup Instructions

### 1. Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)
- Razorpay Account (for payments)
- OpenAI API key (optional, for chatbot)

### 2. Clone and Install

```bash
# Install root dependencies
npm install

# Install all dependencies (client + server)
npm run install-all
```

### 3. Configure Environment

The `server/.env` file is already configured with:

```env
MONGODB_URI=mongodb://localhost:27017/shopkart
JWT_SECRET=shopkart-jwt-secret-key-2024
PORT=8000
RAZORPAY_API_KEY=rzp_test_zKL9lY7yv6EqY8
RAZORPAY_API_SECRET=9cab4PMtPBQTwXuC7nuHYLhb
```

### 4. Start MongoDB

```bash
# If using local MongoDB
mongod
```

### 5. Run the Application

```bash
# Run both client and server
npm run dev

# Or run separately:
npm run server  # Backend on port 8000
npm run client  # Frontend on port 3000
```

### 6. Seed Sample Data

1. Open browser: http://localhost:3000
2. Login as admin: `admin@shopkart.com` / `admin123`
3. Go to Admin Dashboard
4. Click "🌱 Seed Sample Data" button

## Admin Features

### Dashboard
- View total users, products, orders, revenue
- See recent orders at a glance

### Products Management
- Add new products with images, pricing, stock
- Edit existing products
- Delete products
- Mark products as featured

### Categories Management
- Add new categories
- View all categories

### Orders Management
- View all orders with customer details
- Update order status (Pending → Confirmed → Shipped → Delivered)
- Track payment status (COD/Online)

### Users Management
- View all registered users
- Change user roles (Customer/Seller/Admin)
- Sellers can add products
- Admins have full access

## Payment Integration

ShopKart uses **Razorpay** for secure payments:
- Credit/Debit Cards
- UPI (GPay, PhonePe, Paytm)
- Net Banking
- Cash on Delivery (COD)

Test card for Razorpay:
- Card: 4111 1111 1111 1111
- Expiry: Any future date
- CVV: Any 3 digits

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── context/        # React Context (Auth, Cart)
│   │   ├── pages/          # Page components
│   │   └── api/            # API configuration
│   └── public/
├── server/                 # Node.js backend
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   │   ├── auth.js         # Authentication
│   │   ├── products.js     # Products CRUD
│   │   ├── categories.js   # Categories
│   │   ├── cart.js         # Shopping cart
│   │   ├── orders.js       # Orders
│   │   ├── payment.js      # Razorpay integration
│   │   ├── admin.js        # Admin operations
│   │   └── chatbot.js      # AI chatbot
│   └── middleware/         # Auth middleware
└── package.json
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (seller/admin)
- `PUT /api/products/:id` - Update product (seller/admin)

### Payment
- `GET /api/payment/key` - Get Razorpay key
- `POST /api/payment/create-order` - Create payment order
- `POST /api/payment/verify` - Verify payment

### Admin
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/users` - All users
- `PUT /api/admin/users/:id/role` - Update user role
- `DELETE /api/admin/products/:id` - Delete product

## User Roles

| Role | Permissions |
|------|-------------|
| Customer | Browse, Cart, Orders, Reviews |
| Seller | + Add/Edit own products |
| Admin | + Full dashboard, User management, All products |

## License

MIT License - Feel free to use for your business!
