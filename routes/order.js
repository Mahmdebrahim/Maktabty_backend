const express = require("express");
const router = express.Router();
const authMW = require("../middlewares/auth.js");

const {
  createOrder,
  getMyOrders,
  getMySales,
  updateOrderStatus,
  getOrderById,
} = require("../controllers/orderControllers.js");
const isSeller = require("../middlewares/isSeller.js");

router.post("/create", authMW, createOrder);

router.get("/my-orders", authMW, getMyOrders);

router.get("/my-sales", authMW, isSeller, getMySales);

router.get("/:orderId", authMW, getOrderById);

router.patch("/:orderId/status", authMW, isSeller, updateOrderStatus);

module.exports = router;
