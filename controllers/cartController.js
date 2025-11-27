const UserModel = require("../models/users.js");
const BookModel = require("../models/books.js");
const AppError = require("../helpers/appError");


const addToCart = async (req, res, next) => {
    const {bookId, quantity = 1 } = req.body

    const book = await BookModel.findById(bookId);
    if (!book) return next(new AppError("book not available", 404));
    
    const user = await UserModel.findById(req.user.userId)
    if(!user) return next(new AppError("user not found",404))

    const isIncart = user.cart.find(book => book.book._id == bookId)

    if (isIncart) {
      isIncart.quantity += quantity;
    } else {
      user.cart.push({
        book:bookId,
        quantity
      })
    }

    await user.save();
    res.json({
      success: true,
      message: "Added to cart",
      cartCount: user.cart.reduce((sum, item) => sum + item.quantity, 0),
    });

};


const updateCartItem = async (req,res,next) => {
    const bookId = req.params.bookId;
    const {quantity} = req.body;

    const user = await UserModel.findById(req.user.userId);
    if (!user) return next(new AppError("user not found", 404));

    const isIncart = user.cart.find((item) => item.book._id == bookId);
    const itemIndex = user.cart.findIndex(
      (item) => item.book._id == bookId
    );

    if (!isIncart) return next(new AppError("item not found", 404));

    if(quantity <= 0){
      user.cart.splice(itemIndex, 1);
    }else{
      isIncart.quantity = quantity;
    }

    await user.save();
    res.json({ success: true, message: "Cart updated" });
    
}



module.exports = {
  addToCart,
  updateCartItem,
};