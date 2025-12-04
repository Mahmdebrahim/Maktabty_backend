# Frontend Features Guide

## 🎨 User Interface Overview

### Navigation Bar

Located at the top of every page with:

- **Kotoby Logo** - Click to go home
- **Navigation Links**: Home, Books, ❤️ Favorites, 🛒 Cart
- **User Menu**:
  - Shows "Not logged in" or username when logged in
  - Login button (shows when not authenticated)
  - Logout button (shows when authenticated)
  - Seller Panel button (for sellers/admins)
  - Admin Panel button (for admins only)

---

## 📖 Pages & Features

### 1. HOME PAGE

**Path**: `/` or click "Home" in navigation

**What you see**:

- Hero banner with welcome message
- "Browse Books" call-to-action button

**What you can do**:

- Click browse button to go to books page
- Or use navigation to explore other sections

---

### 2. BOOKS PAGE

**Path**: Click "Books" in navigation or "Browse Books" button

**Features**:

#### Filter Section (Top)

```
[Search box] [Category dropdown] [Min Price] [Max Price] [Condition dropdown]
```

- **Search**: Type book title to find books
- **Category**: Filter by book category
- **Price Range**: Set minimum and/or maximum price
- **Condition**: Filter by book condition (New, Very Good, Good, Excellent)

#### Book Grid

- Shows books in a responsive grid layout
- Each card displays:
  - Book image (placeholder if not available)
  - Title
  - Author(s)
  - Condition badge
  - Publication year
  - Price in EGP
  - Seller name
  - Three buttons:
    - **View**: See full details in a modal
    - **Add**: Add to shopping cart
    - **❤️**: Add to/remove from favorites

#### Pagination

- Previous/Next buttons at bottom
- Shows "Page X of Y"

---

### 3. FAVORITES PAGE

**Path**: Click "❤️ Favorites" in navigation

**Requirements**: Must be logged in

**What you see**:

- Grid of all books you've marked as favorite
- Each card is same as Books page
- "No favorites yet" message if empty

**What you can do**:

- View favorite book details
- Add favorite to cart
- Remove from favorites

---

### 4. SHOPPING CART PAGE

**Path**: Click "🛒 Cart" in navigation

**Requirements**: Must be logged in

**Two Sections**:

#### Left: Cart Items

Shows each item with:

- Book image
- Book title
- Price per item
- Seller name
- Quantity controls (-, quantity box, +)
- Remove button
- Subtotal for item

#### Right: Order Summary (Sticky)

```
Subtotal:      EGP XXX
Shipping:      EGP 30
─────────────────────
Total:         EGP XXX
[Proceed to Checkout]
```

**What you can do**:

- Increase/decrease quantities
- Remove items
- Proceed to checkout
- See running total

---

### 5. CHECKOUT MODAL

**Triggered**: Click "Proceed to Checkout" button

**Form Fields**:

```
SHIPPING ADDRESS
[Full Name]
[Phone]
[Address]
[City]

PAYMENT METHOD
[Dropdown: Cash, Card, Online, Wallet]

Total Amount: EGP XXX
[Place Order] button
```

**What you can do**:

- Enter shipping details
- Select payment method
- Confirm order

**Result**:

- Order created successfully
- Get order number
- Cart cleared
- Return to cart page

---

### 6. SELLER PANEL

**Path**: Click "Seller Panel" button (only visible if seller/admin)

**Requirements**: Account with role "seller" or "admin"

#### Three Tabs:

##### Tab 1: My Books

Shows all books you've added:

- Grid view of your books
- Each shows: image, title, price, condition, stock
- Buttons:
  - Edit (coming soon)
  - Delete (removes immediately)

##### Tab 2: Add Book

Form to create new book:

```
[Book Title] *required
[Authors] *required (comma-separated)
[Published Year] *required
[Price] *required
[Quantity] *required
[Description] (text area)
[Category] *required (dropdown)
[Condition] (dropdown: Good, Very Good, New, Excellent)
[Image URLs] (comma-separated URLs)
[Add Book] button
```

##### Tab 3: My Sales

Shows all orders from customers who bought your books:

```
Order #  | Customer | Total | Status | Date | View button
─────────────────────────────────────────────────────────
ORD-... | username | EGP X | pending| 2025 | [View]
```

---

### 7. ADMIN PANEL

**Path**: Click "Admin Panel" button (only visible if admin)

**Requirements**: Account with role "admin"

#### Four Tabs:

##### Tab 1: Users

All users in system:

```
Username | Email | Phone | Role | [Delete]
─────────────────────────────────────────
user1    | ...   | ...   | user | [Delete]
seller1  | ...   | ...   | seller| [Delete]
```

##### Tab 2: All Books

Every book in the catalog:

```
Title | Seller | Price | Quantity | [Delete]
─────────────────────────────────────────────
Book1 | seller | 50    | 10       | [Delete]
```

##### Tab 3: All Orders

Every order ever placed:

```
Order #  | Customer | Total | Status | Date
─────────────────────────────────────────────
ORD-001  | user1    | 150   | pending | 2025
```

##### Tab 4: Categories

Manage book categories:

Top section:

```
[Category Name input]
[Parent Category dropdown]
[Add Category] button
```

Bottom section:

- Tree view of all categories
- Shows hierarchy (indentation)
- Create as main category or sub-category

---

## 🔐 AUTHENTICATION

### Login Modal

**How to access**: Click "Login" button when not logged in

```
TABS: [Login] [Register]

LOGIN TAB:
[Email] *required
[Password] *required
[Login] button
[Error message if fails]
```

### Register Modal

**Accessed from**: Click "Register" tab in auth modal

```
[Username] *required
[Email] *required
[Password] *required
[Phone] *required (format: 01XXXXXXXXX)
[Role] dropdown (Customer, Seller)
[Register] button
[Error message if fails]
```

---

## 💬 USER FEEDBACK

### Notifications

Small toast notifications appear in top-right:

- ✓ Green for success (add to cart, login, etc.)
- ⚠️ Yellow for warnings (empty cart, etc.)
- ✗ Red for errors (failed login, etc.)

Auto-disappear after 3 seconds.

### Loading Indicator

Spinning loader appears in center when:

- Logging in/registering
- Creating order
- Loading data

---

## 🎯 USER ROLE DIFFERENCES

### CUSTOMER

Can access:

- ✅ Home page
- ✅ Browse & search books
- ✅ Favorites
- ✅ Shopping cart
- ✅ Checkout
- ❌ Seller panel (not visible)
- ❌ Admin panel (not visible)

### SELLER

Can access:

- ✅ All customer features
- ✅ Seller panel (add/manage books, view sales)
- ❌ Admin panel (not visible)

### ADMIN

Can access:

- ✅ All features
- ✅ Seller panel
- ✅ Admin panel (full control)

---

## 🎮 INTERACTIVE ELEMENTS

### Buttons

- **Primary (Blue)**: Main actions (Add to Cart, Proceed, Add Book)
- **Secondary (Gray)**: Alternative actions (View, Edit)
- **Danger (Red)**: Destructive actions (Delete, Remove)

### Inputs

- Required fields marked with \*
- Auto-focus on modal open
- Validation on submit
- Clear error messages

### Dropdowns

- Pre-populated from backend
- Categories loaded from database
- Payment methods predefined
- Roles predefined

---

## 📱 RESPONSIVE BEHAVIOR

### Desktop (1200px+)

- Full navigation bar
- Books in 4-5 column grid
- Cart summary sticky on right
- Admin tables full width

### Tablet (768px - 1199px)

- Responsive navigation
- Books in 2-3 column grid
- Cart summary below items
- Admin tables with horizontal scroll

### Mobile (< 768px)

- Hamburger-style navigation
- Books in 1 column
- Stack cart items vertically
- Simplified forms
- Touch-friendly buttons

---

## ✨ INTERACTION FLOWS

### Typical Customer Flow

```
1. Home Page
   ↓ Click Browse Books
2. Books Page
   ↓ Search/Filter books
   ↓ View book details (click View)
3. Book Detail Modal
   ↓ Add to cart
   ↓ Or add to favorites
4. Shopping Cart
   ↓ Adjust quantities
   ↓ Click Proceed
5. Checkout Modal
   ↓ Enter address
   ↓ Select payment
   ↓ Place Order
6. Success!
```

### Typical Seller Flow

```
1. Home Page
2. Seller Panel (click button)
   ↓ Go to "Add Book" tab
3. Form
   ↓ Fill all fields
   ↓ Submit
4. See in "My Books" tab
   ↓ Can delete or edit
5. Go to "My Sales" tab
   ↓ See customer orders
```

### Typical Admin Flow

```
1. Home Page
2. Admin Panel (click button)
   ↓ View/manage users
   ↓ View/manage books
   ↓ View all orders
   ↓ Create categories
3. Take action (delete, add, etc.)
4. Confirm & done
```

---

## 🔄 STATE MANAGEMENT

### Current User

- Displayed in top-right corner
- Updated on login/logout
- Includes role information
- Visible in all pages

### Cart Data

- Stored in backend (persistent)
- Updated when items added/removed
- Shown in cart page
- Used for checkout

### Favorites

- Stored in backend (persistent)
- Updated when toggled
- Shown in favorites page
- Heart icon indicator on book cards

### Session

- JWT token in localStorage
- Auto-logout if token invalid
- Persists across page refresh
- Expires after 7 days

---

## 🎨 COLOR SCHEME

| Element   | Color                | Usage                           |
| --------- | -------------------- | ------------------------------- |
| Primary   | #2c3e50 (Dark Blue)  | Navigation, headers             |
| Secondary | #3498db (Light Blue) | Links, buttons, highlights      |
| Accent    | #e74c3c (Red)        | Alerts, delete buttons          |
| Success   | #27ae60 (Green)      | Success messages, confirmations |
| Warning   | #f39c12 (Orange)     | Warnings, book conditions       |
| Light BG  | #ecf0f1 (Light Gray) | Backgrounds, disabled states    |
| Text      | #2c3e50 (Dark)       | Main text                       |
| Muted     | #7f8c8d (Gray)       | Secondary text, placeholders    |

---

## 📊 DATA DISPLAYED

### Book Cards Show:

- Title (truncated to 2 lines)
- Authors (comma-separated)
- Condition badge
- Publication year
- Price in EGP
- Seller name
- Stock status (In Stock/Out of Stock)

### Order Details Show:

- Order number
- Customer/seller name
- Items with quantities
- Unit prices
- Subtotals
- Shipping cost (30 EGP fixed)
- Total amount
- Order status
- Order date
- Shipping address
- Payment method

### Category Shows:

- Category name
- Hierarchical structure (indent)
- Parent-child relationships
- Active/inactive status

---

## 🚀 PERFORMANCE FEATURES

- Pagination prevents loading too many books at once
- Lazy loading of book images
- Cached API calls where appropriate
- Minimal reflows with efficient updates
- Smooth CSS animations (no janky transitions)
- Responsive without excessive media queries

---

**Frontend Guide Created**: December 3, 2025  
**Version**: 1.0  
**Status**: Complete and Ready to Use
