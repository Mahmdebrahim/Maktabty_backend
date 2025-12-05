const express = require("express");
const router = express.Router();
const authMW = require("../middlewares/auth.js");
const isSeller = require("../middlewares/isSeller.js");
const {
  addReview,
  getReviewsByBook,
} = require("../controllers/reviewControllers.js");

router.post("/:bookId", authMW, addReview);

router.get("/:bookId", authMW, getReviewsByBook);



module.exports = router;

