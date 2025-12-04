const express = require("express");
const router = express.Router();
const authMW = require("../middlewares/auth.js");
const isAdmin = require("../middlewares/isAdmin.js");

const {
  getCategoryTree,
  getSubCategories,
  addCategory,
} = require("../controllers/categoriesControllers.js");


router.get("/tree", authMW, getCategoryTree); 
router.get("/:categoryId/subcategories", authMW, getSubCategories); 
router.post("/", authMW,  addCategory); 

module.exports = router;
