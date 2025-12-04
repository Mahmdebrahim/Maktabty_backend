const OrderModel = require("../models/orders.js");
const UserModel = require("../models/users.js");
const BookModel = require("../models/books.js");
const AppError = require("../helpers/appError.js");

const createOrder = async (req, res, next) => {
  const { shippingAddress, paymentMethod } = req.body;

  if (
    !shippingAddress ||
    !shippingAddress.fullname ||
    !shippingAddress.phone ||
    !shippingAddress.address ||
    !shippingAddress.city
  ) {
    return next(new AppError("Invalid shipping address", 400));
  }

  if (!paymentMethod) {
    return next(new AppError("Payment method is required", 400));
  }

  const user = await UserModel.findById(req.user.userId).populate({
    path: "cart.book",
    select: "quantity title price seller",
  });

  if (!user || user.cart.length === 0) {
    return next(new AppError("Cart is empty", 400));
  }

  const items = [];
  let totalAmount = 0;

  for (const cartItem of user.cart) {
    const book = cartItem.book;

    if (!book) {
      return next(new AppError("Book not found in cart", 404));
    }

    if (book.quantity < cartItem.quantity) {
      return next(
        new AppError(
          `Not enough stock for ${book.title}. Available: ${book.quantity}`,
          400
        )
      );
    }

    const subtotal = book.price * cartItem.quantity;

    items.push({
      book: book._id,
      price: book.price,
      quantity: cartItem.quantity,
      subtotal: subtotal,
      seller: book.seller,
    });

    totalAmount += subtotal;

    // Update book stock
    book.quantity -= cartItem.quantity;
    book.soldCount = +cartItem.quantity;

    if (book.quantity === 0) {
      book.isSoldOut = true;
    } else {
      book.isSoldOut = false;
    }

    await book.save();
  }

  const order = await OrderModel.create({
    customer: req.user.userId,
    items,
    shippingAddress: {
      fullname: shippingAddress.fullname,
      phone: shippingAddress.phone,
      address: shippingAddress.address,
      city: shippingAddress.city,
    },
    shippingCost: 30,
    paymentMethod,
    status: "pending",
    paymentStatus: "pending",
    totalAmount: totalAmount + 30,
  });

  // Clear user's cart and add order to history
  user.cart = [];
  user.orders = user.orders || [];
  user.orders.push(order._id);

  await user.save();
  await order.populate("items.book items.seller customer");

  res.status(201).json({
    success: true,
    message: "Order created successfully",
    orderNumber: order._id,
    data: order,
  });
};

const getMyOrders = async (req, res, next) => {
  const orders = await OrderModel.find({ customer: req.user.userId })
    .populate("items.book items.seller")
    .sort("-createdAt");

  res.json({ success: true, data: orders });
};

const getOrderById = async (req, res, next) => {
  const order = await OrderModel.findById(req.params.orderId)
    .populate("customer", "username email phone")
    .populate("items.book", "title images author price")
    .populate("items.seller", "username phone");

  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  res.status(200).json({
    success: true,
    order,
  });
};

const getMySales = async (req, res, next) => {
  const orders = await OrderModel.find({ "items.seller": req.user.userId })
    .populate("customer", "username phone")
    .populate("items.book")
    .sort("-createdAt");

  res.json({ success: true, data: orders });
};

const updateOrderStatus = async (req, res, next) => {
  const { status } = req.body;
  const order = await OrderModel.findById(req.params.orderId);

  if (!order) return next(new AppError("Order not found", 404));

  order.status = status;
  order.updatedAt = Date.now();
  if (status === "delivered") {
   order.paymentStatus = "paid";
  }else if (status === "cancelled") {
   order.paymentStatus = "refunded";
  }else{
   order.paymentStatus = "pending";
  }
  await order.save();

  res.json({ success: true, message: "Status updated", data: order });
};

module.exports = {
  createOrder,
  getMyOrders,
  getMySales,
  updateOrderStatus,
  getOrderById,
};
