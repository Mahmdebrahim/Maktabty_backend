const express = require("express");
const router = express.Router();
const authMW = require("../middlewares/auth.js");
const isSeller = require("../middlewares/isSeller.js");
const addBookValidation = require("../middlewares/bookvalidation.js");
const { addBook } = require("../controllers/bookControllers.js");
const {
  getBooks,
  getCategories,
  getSingleBook,
  updateBook,
  delelteBook,
} = require("../controllers/bookControllers.js");


router.post("/", authMW, isSeller, addBookValidation, addBook);

router.get("/", authMW, getBooks);

router.get("/:bookId", authMW, getSingleBook);

router.patch("/:bookId", authMW, isSeller, updateBook);

router.delete("/:bookId", authMW, isSeller, delelteBook);


/////////////////////////////////////////////////
router.get("/categories", authMW, getCategories);


module.exports = router;