const reviewModel = require("../models/review.js");
const UserModel = require("../models/users.js");
const BookModel = require("../models/books.js");
const AppError = require("../helpers/appError.js");

const addReview = async (req, res, next) => {
  const { bookId } = req.params;
  const { rating, comment } = req.body;
  const book = await BookModel.findById(bookId);
  const user = await UserModel.findById(req.user.userId);
  
  if (!book) {
    return next(new AppError("Book not found", 404));
  }
  if (req.user.userId == book.seller && user.role == "seller" || user.role == "admin") {
    return next(new AppError("You cannot review your own book", 400));
  }
  const review = await reviewModel.create({
    book: bookId,
    user: req.user.userId,
    rating,
    comment,
  });
  book.reviews.push(review._id);
  await book.save();


  user.reviews = review._id;
  await user.save();

  res.status(201).json({
    success: true,
    message: "Review added successfully",
    data: review,
  });
};

const getReviewsByBook = async (req, res, next) => {
  const { bookId } = req.params;
  const book = await BookModel.findById(bookId)
    .populate({ 
        path: 'reviews', 
        populate: { path: 'user', select: 'username' } 
    })

    if (book.reviews.length === 0) {
        return next(new AppError("No reviews found for this book", 404));
    }
    const avgRating = book.reviews.reduce((total, review) => {
        return  total + review.rating;
    }, 0) / book.reviews.length;
    const firstDecimal = Math.floor(avgRating * 10) % 10;
  res.status(200).json({
    success: true,
    data: book.reviews,
    averageRating: +avgRating.toFixed(firstDecimal > 0 ? 1 : 0),
  });
};

module.exports = {
  addReview,
  getReviewsByBook,
};
