const express = require("express");
const router = express.Router();
const authMW = require("../middlewares/auth.js");
const {
  addTofavorites,
  getAllFavorites,
  checkFavorite,
} = require("../controllers/favoriteController.js");



router.post("/toggle", authMW, addTofavorites);


router.get("/", authMW, getAllFavorites);


router.get("/check/:bookId", authMW, checkFavorite);







module.exports = router;