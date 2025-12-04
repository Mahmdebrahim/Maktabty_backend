const OrderModel = require("../models/orders.js");
const UserModel = require("../models/users.js");
const BookModel = require("../models/books.js");
const AppError = require("../helpers/appError.js");




const getAllUsers = async (req, res) => {
  // ** Exclude admin users from the list
    const users = await UserModel.find({role:{$ne:"admin"}}).select("-password");
    res.json({ success: true, data: users });
};

const deleteUser = async (req, res) => {
    const userId = req.params.userId;

    // Delete all related data: books, orders, etc.
    await BookModel.deleteMany({ seller: userId });
    await OrderModel.deleteMany({ customer: userId });
    await OrderModel.updateMany({}, { $pull: { items: { seller: userId } } });

    await UserModel.findByIdAndDelete(userId);

    res.json({ success: true, message: "User and all related data deleted" });
};

const getAllBooks = async (req, res) => {
    const books = await BookModel.find({ quantity: { $ne: 0 } }).populate(
      "seller",
      "username phone"
    );
    res.json({ success: true, data: books });
};

const deleteBook = async (req, res) => {
    await BookModel.findByIdAndDelete(req.params.bookId);
    await UserModel.findByIdAndUpdate(req.user.userId, {
      $pull: { books: req.params.bookId },
    });

    await UserModel.updateMany(
      {
        $or: [
          { favorites: req.params.bookId },
          { "cart.book": req.params.bookId },
        ],
      },
      
      {
        $pull: { 
            favorites: req.params.bookId, 
            "cart.book": req.params.bookId 
        },
      }
    );

    res.json({ success: true, message: "Book deleted by admin" });
};

const getAllOrders = async (req, res) => {
    const orders = await OrderModel.find()
      .populate("customer", "username phone")
      .populate("items.book items.seller");
    res.json({ success: true, data: orders });
};


module.exports = {
  getAllUsers,
  deleteUser,
  getAllBooks,
  deleteBook,
  getAllOrders
};