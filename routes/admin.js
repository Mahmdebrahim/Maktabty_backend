const express = require("express");
const router = express.Router();
const authMW = require("../middlewares/auth.js");
const isAdmin = require("../middlewares/isAdmin.js");

const {
  getAllUsers,
  deleteUser,
  getAllBooks,
  deleteBook,
  getAllOrders,
//   getStats,
} = require("../controllers/adminControllers.js");



// router.use(authMW);

// router.use(isAdmin);

router.get("/users", authMW, isAdmin, getAllUsers);
router.delete("/users/:userId", deleteUser);

router.get("/books", getAllBooks);
router.delete("/books/:bookId", deleteBook);

router.get("/orders", getAllOrders);

// router.get("/stats", getStats);

module.exports = router;