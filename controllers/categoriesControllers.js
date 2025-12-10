// controllers/categoryController.js
const CategoryModel = require("../models/categories.js");
const BookModel = require("../models/books.js");
const AppError = require("../helpers/appError.js");




const getCategoryTree = async (req, res,next) => {
    const categories = await CategoryModel.find({ parent: null, isActive: true })
      .populate("children")
      .lean({ virtuals: true }); // ← لازم عشان children تظهر
    if (!categories) {
        return next(new AppError("No categories found", 404));
    }
    
    res.json({ success: true, data: categories });
};

const getAllSubCategories = async (req, res,next) => {
    const categories = await CategoryModel.find({ parent: { $ne: null }, isActive: true }).lean({ virtuals: true });
    if (!categories) {
        return next(new AppError("No categories found", 404));
    }
    
    res.json({ success: true, data: categories });
}

const getSubCategories = async (req, res,next) => {
    const { categoryId } = req.params;

    const category = await CategoryModel.findById(categoryId)
      .populate("children")
      .lean({ virtuals: true });

    if (!category) {
        return next(new AppError("Category not found", 404));
    }

    res.json({
      success: true,
      data: category,
    });
};

const addCategory = async (req, res,next) => {
    const { name, parent } = req.body;

    if (parent) {
      const parentCat = await CategoryModel.findById(parent);
      if (!parentCat)
        return next(new AppError("Parent category not found", 400));
    }

    const category = await CategoryModel.create({ name, parent });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
    
};

module.exports = {
  getCategoryTree,
  getSubCategories,
  addCategory,
  getAllSubCategories,
};
