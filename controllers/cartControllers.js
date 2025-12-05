const UserModel = require("../models/users.js");
const BookModel = require("../models/books.js");
const AppError = require("../helpers/appError.js");

const addToCart = async (req, res, next) => {
  const { bookId, quantity = 1 } = req.body;

  const book = await BookModel.findById(bookId);
  if (!book) return next(new AppError("book not available", 404));

  const user = await UserModel.findById(req.user.userId);
  if (!user) return next(new AppError("user not found", 404));

  if (req.user.userId == book.seller) {
    return next(new AppError("You cannot add your own book to the cart", 400));
  } else if (user.role === "admin") {
    return next(new AppError("Admins cannot add books to the cart", 400));
  }
  
  const isIncart = user.cart.find((book) => book.book._id == bookId);

  if (isIncart) {
    isIncart.quantity += quantity;
  } else {
    user.cart.push({
      book: bookId,
      quantity,
      price: book.price,
      seller: book.seller,
    });
  }

  await user.save();
  res.json({
    success: true,
    message: "Added to cart",
    cartCount: user.cart.reduce((sum, item) => sum + item.quantity, 0),
  });
};

const updateCartItem = async (req, res, next) => {
  const bookId = req.params.bookId;
  const { quantity } = req.body;

  const user = await UserModel.findById(req.user.userId);
  if (!user) return next(new AppError("user not found", 404));

  const isIncart = user.cart.find((item) => item.book._id == bookId);
  const itemIndex = user.cart.findIndex((item) => item.book._id == bookId);

  if (!isIncart) return next(new AppError("item not found", 404));

  if (quantity <= 0) {
    user.cart.splice(itemIndex, 1);
  } else {
    isIncart.quantity = quantity;
  }

  await user.save();
  res.json({ success: true, message: "Cart updated" });
};

const removeFromCart = async (req, res, next) => {
  const { bookId } = req.params;
  const user = await UserModel.findById(req.user.userId);
  if (!user) return next(new AppError("User not found", 404));

  user.cart = user.cart.filter((item) => item.book != bookId);
  await user.save();

  res.json({ success: true, message: "Removed from cart" });
};

const getCart = async (req, res) => {
  const user = await UserModel.findById(req.user.userId).populate({
    path: "cart.book",
    select: "title author price images condition",
    populate: {
      path: "seller",
      select: "username phone",
    },
  });

  if (!user) return next(new AppError("User not found", 404));

  const cartWithDetails = user.cart.map((item) => ({
    _id: item.book._id,
    title: item.book.title,
    author: item.book.author,
    price: item.book.price,
    images: item.book.images,
    condition: item.book.condition,
    quantity: item.quantity,
    totalPrice: item.book.price * item.quantity,
  }));

  const total = cartWithDetails.reduce((sum, item) => sum + item.totalPrice, 0);

  res.json({
    success: true,
    data: cartWithDetails,
    totalItems: user.cart.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: total,
  });
};

module.exports = {
  addToCart,
  updateCartItem,
  removeFromCart,
  getCart,
};
