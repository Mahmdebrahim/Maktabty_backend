# Backend Issues - Required Fixes

## 🚨 Critical Issues (Must Fix Before Production)

### Issue #1: Order Creation Request Format Mismatch

**Severity**: 🔴 CRITICAL  
**File**: `controllers/orderControllers.js`  
**Lines**: 6-7

**Problem**:
The controller expects flat request body parameters, but should accept nested `shippingAddress` object.

**Current Code**:

```javascript
const createOrder = async (req, res, next) => {
  const { fullname, phone, address, city, paymentMethod } = req.body;
  // ... expects: { fullname, phone, address, city, paymentMethod }
```

**What the frontend sends**:

```javascript
{
    shippingAddress: {
        fullname: "John Doe",
        phone: "01234567890",
        address: "123 Main St",
        city: "Cairo"
    },
    paymentMethod: "cash"
}
```

**Fix**:

```javascript
const createOrder = async (req, res, next) => {
  const { shippingAddress, paymentMethod } = req.body;
  const { fullname, phone, address, city } = shippingAddress;

  // Validate shippingAddress
  if (!fullname || !phone || !address || !city) {
    return next(new AppError("Complete shipping address is required", 400));
  }
```

**Impact**: Orders cannot be created without this fix.

---

### Issue #2: Incorrect Quantity Calculation in Order Items

**Severity**: 🔴 CRITICAL  
**File**: `controllers/orderControllers.js`  
**Lines**: 23-27

**Problem**:
When creating order items, the code uses the entire book's stock quantity instead of the quantity purchased by the customer.

**Current Code**:

```javascript
items.push({
  book: book._id,
  price: book.price,
  quantity: book.quantity, // ❌ WRONG: Uses all stock
  subtotal: book.price * book.quantity, // ❌ WRONG: Multiplies by all stock
  seller: book.seller,
});
```

**Fix**:

```javascript
items.push({
  book: book._id,
  price: book.price,
  quantity: item.quantity, // ✓ Use cart item quantity
  subtotal: book.price * item.quantity, // ✓ Correct calculation
  seller: book.seller,
});
```

**Impact**: Order records show wrong quantities and totals.

---

### Issue #3: Wrong Field Reference in Order Authorization

**Severity**: 🔴 CRITICAL  
**File**: `controllers/orderControllers.js`  
**Line**: 60

**Problem**:
Code references `order.user` but the Order model uses `customer` field.

**Current Code**:

```javascript
if (
  order.user._id.toString() !== req.user.userId.toString() &&
  req.user.role !== "admin"
) {
  return next(new AppError("Not authorized to view this order", 403));
}
```

**Fix**:

```javascript
if (
  order.customer._id.toString() !== req.user.userId.toString() &&
  req.user.role !== "admin"
) {
  return next(new AppError("Not authorized to view this order", 403));
}
```

**Impact**: Users cannot view their orders; will get 403 errors.

---

### Issue #4: Typo in Login Response

**Severity**: 🟠 HIGH (but has workaround)  
**File**: `controllers/authControllers.js`  
**Line**: 48

**Problem**:
Token field is misspelled as `tokem` instead of `token`.

**Current Code**:

```javascript
res.send({ user, tokem: token }); // ❌ Typo
```

**Fix**:

```javascript
res.send({ user, token }); // ✓ Correct
```

**Current Workaround**: Frontend handles this with `data.tokem || data.token`

**Impact**: Unnecessary workaround in frontend code.

---

## 🟠 High Priority Issues (Should Fix Soon)

### Issue #5: Invalid Role Assignment in Signup

**Severity**: 🟠 HIGH  
**File**: `controllers/authControllers.js`  
**Line**: 16

**Problem**:
Uses bitwise OR operator instead of proper role validation.

**Current Code**:

```javascript
role: "user" | "seller",  // ❌ This is bitwise OR, equals "user"
```

**Fix**:

```javascript
const validRoles = ["seller", "user"];
const role = validRoles.includes(req.body.role) ? req.body.role : "user";

const user = await UserModel.create({
  username,
  password,
  email,
  phone,
  role, // Use validated role
});
```

**Impact**: Users can't properly select seller role during signup.

---

### Issue #6: Book Model Enum Issues

**Severity**: 🟠 HIGH  
**File**: `models/books.js`  
**Line**: 43-46

**Problems**:

1. "exellant" is misspelled (should be "excellent")
2. Default value is Arabic text "جيد" but doesn't match enum

**Current Code**:

```javascript
condition: {
  type: String,
  enum: ["good","very good","new","exellant",],  // ❌ Misspelled
  default: "جيد",  // ❌ Arabic, not in enum
},
```

**Fix**:

```javascript
condition: {
  type: String,
  enum: ["good", "very good", "new", "excellent"],
  default: "good",
},
```

**Impact**: Books with default condition will fail validation.

---

### Issue #7: Missing Database Connection Call

**Severity**: 🟠 HIGH  
**File**: `main.js`  
**Line**: 7

**Problem**:
`connectDB` is imported but never invoked.

**Current Code**:

```javascript
const connectDB = require("./config/db.js");
// ... no call to connectDB()
```

**Fix**:

```javascript
const connectDB = require("./config/db.js");

connectDB(); // Add this line

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
```

**Impact**: Application might not actually connect to MongoDB.

---

## 🟡 Medium Priority Issues

### Issue #8: No Validation for Shipping Address

**Severity**: 🟡 MEDIUM  
**File**: `routes/order.js`, `controllers/orderControllers.js`

**Problem**:
Shipping address fields are not validated before creating order.

**Recommendation**:
Create validation middleware similar to `addBookValidation.js`:

```javascript
// middlewares/orderValidation.js
const Joi = require("joi");

const createOrderSchema = Joi.object({
  shippingAddress: Joi.object({
    fullname: Joi.string().min(3).required(),
    phone: Joi.string()
      .pattern(/^01[0125][0-9]{8}$/)
      .required(),
    address: Joi.string().min(5).required(),
    city: Joi.string().min(2).required(),
  }).required(),
  paymentMethod: Joi.string()
    .valid("cash", "card", "online", "wallet")
    .required(),
});

module.exports = (req, res, next) => {
  const { error } = createOrderSchema.validate(req.body);
  if (error) return next(new AppError(error.message, 400));
  next();
};
```

Then use in route:

```javascript
router.post("/create", authMW, createOrderValidation, createOrder);
```

---

### Issue #9: Inconsistent Error Response Format

**Severity**: 🟡 MEDIUM  
**Files**: Multiple controllers

**Problem**:
Some places use `AppError`, some use `Error`, with inconsistent response structures.

**Example inconsistencies**:

```javascript
return next(new AppError("message", 400)); // Some use this
return next(new Error("message", 400)); // Some use this
```

**Recommendation**:
Always use `AppError` consistently. Verify `helpers/appError.js` is correct:

```javascript
class AppError extends Error {
  constructor(message, statusCode, details = []) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

module.exports = AppError;
```

---

### Issue #10: No CORS Configuration

**Severity**: 🟡 MEDIUM  
**File**: `main.js`

**Problem**:
No CORS headers set (works now since frontend/backend are same origin, but not scalable).

**Recommendation**:

```javascript
const cors = require("cors");

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
```

---

### Issue #11: Hardcoded JWT Secret

**Severity**: 🟡 MEDIUM  
**Files**: `controllers/authControllers.js`, `middlewares/auth.js`

**Current Code**:

```javascript
jwt.sign({ userId: user._id }, "secretKey");
jwt.verify(token, "secretKey", ...);
```

**Fix**:

```javascript
const jwtSecret = process.env.JWT_SECRET || 'default-secret-key-change-in-production';

jwt.sign({ userId: user._id }, jwtSecret);
jwt.verify(token, jwtSecret, ...);
```

---

## 🟢 Low Priority / Nice-to-Have

### Issue #12: Add Rate Limiting

**Recommendation**: Add `express-rate-limit` to prevent brute force attacks:

```javascript
const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: "Too many login attempts, please try again later",
});

router.post("/auth/login", loginLimiter, loginValidation, login);
```

---

### Issue #13: Input Sanitization

**Recommendation**: Add input sanitization to prevent injection attacks:

```javascript
const mongoSanitize = require("express-mongo-sanitize");
app.use(mongoSanitize());
```

---

### Issue #14: Add Request Logging

**Recommendation**: Add morgan for request logging:

```javascript
const morgan = require("morgan");
app.use(morgan("combined"));
```

---

## ✅ Fix Priority Checklist

```
Critical Issues (Fix First):
☐ Issue #1: Order creation request format
☐ Issue #2: Order quantity calculation
☐ Issue #3: Wrong field reference (customer vs user)

High Priority:
☐ Issue #4: Fix "tokem" typo
☐ Issue #5: Fix role assignment in signup
☐ Issue #6: Fix enum values in book model
☐ Issue #7: Call connectDB()

Medium Priority:
☐ Issue #8: Add shipping address validation
☐ Issue #9: Standardize error responses
☐ Issue #10: Add CORS configuration
☐ Issue #11: Use environment variables for secrets

Nice-to-Have:
☐ Issue #12: Add rate limiting
☐ Issue #13: Add input sanitization
☐ Issue #14: Add request logging
```

---

## 🚀 After Fixes

Once these issues are fixed:

1. Run the frontend from `http://localhost:5000/`
2. Create test accounts and run through all workflows
3. Verify orders are created with correct quantities
4. Check all authorization rules work properly
5. Ready for production deployment

---

**Severity Legend**:

- 🔴 CRITICAL: Breaks core functionality
- 🟠 HIGH: Important for reliability
- 🟡 MEDIUM: Should be improved
- 🟢 LOW: Nice improvements

**Status**: Issues identified and documented  
**Frontend Status**: ✅ Ready to test (will show errors from backend issues)
**Backend Status**: ⚠️ Functional but needs fixes listed above
