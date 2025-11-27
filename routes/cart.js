const express = require("express");
const router = express.Router();
const authMW = require("../middlewares/auth.js");
const {
  addToCart,
  updateCartItem,
} = require("../controllers/cartController.js");


router.post("/", authMW, addToCart);

router.put("/:bookId", authMW, updateCartItem);





module.exports = router;