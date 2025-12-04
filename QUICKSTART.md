# Kotoby - Quick Start Guide

## 🚀 Getting Started

### 1. Install Dependencies

```bash
cd /path/to/kotoby
npm install
```

### 2. Configure Environment

Create a `.env` file in the root directory:

```env
MONGODB_URI=mongodb://localhost:27017/kotoby
JWT_SECRET=your-secret-key-here
NODE_ENV=development
PORT=5000
```

### 3. Ensure MongoDB Connection

Make sure `connectDB()` is called in `main.js`. Currently, it's imported but not executed.

### 4. Start the Server

```bash
npm run dev
```

The server will start at `http://localhost:5000`

---

## 📱 Frontend Access

Open your browser and go to:

```
http://localhost:5000/
```

---

## 🧪 Testing the Application

### Test User Accounts

#### Admin Account (for testing)

```
Email: admin@kotoby.com
Password: admin123
```

#### Seller Account

```
Email: seller@kotoby.com
Password: seller123
```

#### Customer Account

```
Email: customer@kotoby.com
Password: customer123
```

_Note: Create these accounts using the frontend registration form or database seeding_

---

## 📊 Frontend Features

### 1. **Authentication**

- ✅ Login with email/password
- ✅ Register as customer or seller
- ✅ Automatic role assignment
- ✅ Token-based session management

### 2. **Browse Books**

- ✅ View all books with pagination
- ✅ Filter by category, price range, condition
- ✅ Search by book title
- ✅ View detailed book information

### 3. **Shopping**

- ✅ Add books to cart
- ✅ Adjust quantities
- ✅ View order summary with shipping costs
- ✅ Proceed to checkout
- ✅ Place orders with various payment methods

### 4. **Favorites**

- ✅ Add/remove books from favorites
- ✅ View all favorite books
- ✅ One-click add to cart from favorites

### 5. **Seller Features**

- ✅ View all your books
- ✅ Add new books (with validation)
- ✅ Delete books
- ✅ View your sales/orders
- ✅ Track order status

### 6. **Admin Features**

- ✅ Manage all users (view/delete)
- ✅ Manage all books (view/delete)
- ✅ View all orders in the system
- ✅ Create and organize categories

---

## 🔌 API Endpoints Quick Reference

### Authentication

```
POST /users/auth/register
POST /users/auth/login
POST /users/auth/logout
GET /users/auth/profile
PATCH /users/auth/profile
```

### Books

```
GET /books                  - List books with filters
GET /books/:bookId          - Get book details
POST /books                 - Add book (seller only)
PATCH /books/:bookId        - Update book (seller only)
DELETE /books/:bookId       - Delete book (seller only)
```

### Cart

```
POST /cart                  - Add to cart
PUT /cart/:bookId           - Update cart item quantity
```

### Favorites

```
POST /favorites/toggle      - Toggle favorite
GET /favorites              - Get all favorites
GET /favorites/check/:bookId - Check if book is favorite
```

### Orders

```
POST /orders/create         - Create order
GET /orders/my-orders       - Get user's orders
GET /orders/:orderId        - Get order details
GET /orders/my-sales        - Get seller's sales (seller only)
PATCH /orders/:orderId/status - Update order status (seller only)
```

### Categories

```
GET /categories/tree        - Get category tree
GET /categories/:categoryId/subcategories
GET /categories/:categoryId/books
POST /categories            - Create category (admin only)
```

### Admin

```
GET /admin/users            - List all users (admin only)
DELETE /admin/users/:userId - Delete user (admin only)
GET /admin/books            - List all books (admin only)
DELETE /admin/books/:bookId - Delete book (admin only)
GET /admin/orders           - List all orders (admin only)
```

---

## 🔧 Troubleshooting

### "Cannot GET /" Error

**Solution**: Make sure `app.use(express.static('public'))` is in `main.js` and server is running.

### "Token not valid" Error

**Solution**: Clear localStorage and log in again. Check JWT_SECRET environment variable.

### "Cannot add to cart" Error

**Solution**: Ensure you're logged in. Token should be in cookies.

### Database Connection Issues

**Solution**: Verify MongoDB is running and `connectDB()` is called in `main.js`.

### CORS Errors in Browser

**Solution**: This is expected since frontend and backend are same-origin. If deploying separately, add CORS middleware.

---

## 📁 Project Structure

```
kotoby/
├── public/              # Frontend files (NEW)
│   ├── index.html       # Main HTML file
│   ├── styles.css       # Complete styling
│   └── app.js           # JavaScript application logic
├── config/
│   └── db.js            # Database configuration
├── constants/
│   └── categories.js    # Category constants
├── controllers/         # Business logic
│   ├── authControllers.js
│   ├── bookControllers.js
│   ├── cartControllers.js
│   ├── orderControllers.js
│   ├── favoriteControllers.js
│   ├── categoriesControllers.js
│   ├── adminControllers.js
│   └── userController.js
├── models/              # Mongoose schemas
│   ├── users.js
│   ├── books.js
│   ├── orders.js
│   └── categories.js
├── middlewares/         # Authentication & validation
│   ├── auth.js
│   ├── authvalidation.js
│   ├── bookvalidation.js
│   ├── error.js
│   ├── isAdmin.js
│   └── isSeller.js
├── routes/              # API routes
│   ├── users.js
│   ├── book.js
│   ├── cart.js
│   ├── order.js
│   ├── favorites.js
│   ├── categories.js
│   └── admin.js
├── main.js              # Express app entry point (MODIFIED)
├── package.json
├── CODE_REVIEW.md       # Detailed backend review (NEW)
└── QUICKSTART.md        # This file (NEW)
```

---

## ✅ Next Steps

1. **Review the CODE_REVIEW.md** for backend issues and recommendations
2. **Test the frontend** with all features
3. **Create test accounts** as needed
4. **Report any bugs** or unexpected behavior
5. **Implement recommended fixes** from CODE_REVIEW.md

---

## 📝 Notes

- Frontend is fully responsive and works on mobile devices
- All data persists in MongoDB
- Token expires after 7 days
- Images can be added as URLs in the database
- Payment methods are currently mocked (no actual processing)

---

## 💡 Frontend Architecture

The frontend is built as a single-page application (SPA) with:

- **No build tools required** - Pure HTML/CSS/JS
- **API-first design** - All data from backend API
- **Modular JS** - App object with organized methods
- **Error handling** - User-friendly error messages
- **Loading states** - Visual feedback during API calls
- **Responsive design** - Works on all screen sizes

---

**Status**: ✅ Ready for Testing
**Last Updated**: December 3, 2025
