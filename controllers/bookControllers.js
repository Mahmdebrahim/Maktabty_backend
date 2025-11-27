const UserModel = require("../models/users.js");
const BookModel = require("../models/books.js");
const CATEGORIES = require("../constants/categories.js");
const AppError = require("../helpers/appError.js");

const addBook = async (req, res, next) => {
  const {
    title,
    author,
    publishedYear,
    price,
    images,
    quantity,
    condition,
    category,
    description,
  } = req.body;

  const book = await BookModel.create({
    title,
    author,
    price,
    publishedYear,
    quantity,
    condition,
    description,
    images,
    category,
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

  // ** get the bookes
  const books = await BookModel.find(query)
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("seller", "username phone")
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
  const book = await BookModel.findById(req.params.id).populate(
    "seller",
    "name phone"
  );

  if (!book || book.quantity === 0)
    return next(new Error("Book not found or unavailable", 404));

  res.json({ success: true, data: book });
};

const updateBook = async(req,res,next) => {
  const book = await BookModel.findById(req.params.bookId);
  if(!book) return next(new AppError("Book not found",404));

  const updatedBook = await BookModel.findByIdAndUpdate(
    req.params.bookId,
    { $set: req.body },
    { new: true, runValidators: true }
  );
  
  if(!updateBook) return next(new AppError("error in update",403))

  res.json({
    message: "Book updated successfully",
    data: updatedBook,
  });
}

const delelteBook = async (req,res,next) => {
  const book = await BookModel.findById(req.params.bookId);

  if (!book)
   return next(new AppError("Book not found",404));

  await BookModel.findByIdAndDelete(req.params.bookId);
  res.json({ success: true, message: "Book deleted successfully" });
}








const getCategories = async (req, res) => {
  res.json({
    category: CATEGORIES,
  });
};



module.exports = {
  addBook,
  getBooks,
  getCategories,
  getSingleBook,
  updateBook,
  delelteBook,
};

