const UserModel = require("../models/users.js");
const BookModel = require("../models/books.js");
const AppError = require("../helpers/appError");

// ** add the book to fav List
const addTofavorites = async (req, res, next) => {
    const { bookId } = req.body;
    const favBook = await BookModel.findById(bookId);
    if(!favBook) return next(new AppError("Book not found",404))

    const user = await UserModel.findById(req.user.userId);
    if(!user) return next(new AppError("user not found",404))

    const isFavorite = user.favorites.includes(bookId);
    if(isFavorite){
        user.favorites = user.favorites.filter(id => id != bookId)
    }else{
        user.favorites.push(bookId);
    }

    await user.save();
    res.json({
      message: isFavorite ? "Removed from favorites" : "Added to favorites",
      isFavorite: !isFavorite,
      favoritesCount: user.favorites.length,
    });
};

// ** get all books ni fav List
const getAllFavorites = async(req, res, next) => {
    const favList = await UserModel.findById(req.user.userId).select
    ("favorites")

    if(!favList) return next(new AppError("favorites List is not found",404))

    res.json({
      data: favList,
      count: favList.length,
    });
};

// ** check the spicefic book is fav or no 
const checkFavorite = async (req, res) => {

    const { bookId } = req.params;
    const user = await UserModel.findById(req.user.userId);

    const isFavorite = user.favorites.includes(bookId);

    res.json({ success: true, isFavorite });
  
};

module.exports = {
  addTofavorites,
  getAllFavorites,
  checkFavorite,
};