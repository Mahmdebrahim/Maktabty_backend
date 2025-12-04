const UserModel = require("../models/users.js");
const BookModel = require("../models/books.js");
const CategoryModel = require("../models/categories.js");
const AppError = require("../helpers/appError.js");


const addBook = async (req, res, next) => {
  const {
    title,
    author,
    publishedYear,
    price,
    quantity,
    condition,
    category,
    subCategory,
    description,
    images,
  } = req.body;

  const categoryExists = await CategoryModel.findOne({
    _id: category,
    isActive: true,
  });

  if (!categoryExists) {
    return next(new AppError("Invalid or inactive category", 400));
  }
  const book = await BookModel.create({
    title,
    author,
    price,
    publishedYear,
    quantity,
    condition,
    description,
    category,
    subCategory,
    images,
    seller: req.user.userId,
  });

  if (!book) return next(new Error("error in add book", 400));

  const user = await UserModel.findByIdAndUpdate(req.user.userId, {
    $push: { books: book._id },
  });

  if (!user) return next(new Error("No user found", 404));
  user.save();

  res.send({
    message: "Book added successfully",
    book,
    user,
  });
};

const getBooks = async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    category,
    minPrice,
    maxPrice,
    condition,
    search,
    seller,
  } = req.query;

  // ** filtered queries
  const query = {};
  if (category) query.category = category;
  if (minPrice && maxPrice) {
    query.price = { $gte: minPrice, $lte: maxPrice };
  } else if (minPrice) {
    query.price = { $gte: minPrice };
  } else if (maxPrice) {
    query.price = { $lte: maxPrice };
  }
  if (condition) query.condition = condition;
  if (search) query.title = { $regex: search, $options: "i" };
  if (seller && seller !== req.user.userId) {
    return next(new AppError("You can only view your own books", 403));
  }
  if (seller === req.user.userId) {
    query.seller = seller;
  }

  // ** get the bookes with pagination and populate seller and category
  const books = await BookModel.find(query)
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("seller", "username phone")
    .populate("category", "name")
    .sort({ createdAt: -1 });

  if (!books) return next(new Error("No books found", 404));

  const totalBooks = await BookModel.countDocuments(query);

  const totalPages = Math.ceil(totalBooks / limit);

  res.send({
    data: books,
    pagination: {
      totalBooks,
      totalPages,
      currentPage: page,
      limit,
    },
  });
};

const getSingleBook = async (req, res, next) => {
  const book = await BookModel.findById(req.params.bookId)
    .populate("seller", "username phone")
    .populate("category", "name");

  if (!book) return next(new Error("Book not found or unavailable", 404));

  res.json({ success: true, data: book });
};

const updateBook = async (req, res, next) => {
  const book = await BookModel.findById(req.params.bookId);
  if (!book) return next(new AppError("Book not found", 404));

  const updatedBook = await BookModel.findByIdAndUpdate(
    req.params.bookId,
    { $set: req.body },
    { new: true, runValidators: true }
  );
  if (updatedBook.quantity !== 0) {
    updatedBook.isSoldOut = false;
  }
  await updatedBook.save();
  if (!updateBook) return next(new AppError("error in update", 403));

  res.json({
    message: "Book updated successfully",
    data: updatedBook,
  });
};

const delelteBook = async (req, res, next) => {
  const book = await BookModel.findById(req.params.bookId);

  if (!book) return next(new AppError("Book not found", 404));

  await BookModel.findByIdAndDelete(req.params.bookId);
  await UserModel.findByIdAndUpdate(req.user.userId, {
    $pull: { books: req.params.bookId },
  });

  res.json({ success: true, message: "Book deleted successfully" });
};

module.exports = {
  addBook,
  getBooks,
  getSingleBook,
  updateBook,
  delelteBook,
};
