const express = require("express");
const router = express.Router();
const authMW = require("../middlewares/auth.js");
const {
  addToCart,
  updateCartItem,
  removeFromCart,
  getCart,
} = require("../controllers/cartControllers.js");


router.post("/", authMW, addToCart);

router.put("/:bookId", authMW, updateCartItem);

router.delete("/remove/:bookId", authMW, removeFromCart);

router.get("/", authMW, getCart);



module.exports = router;