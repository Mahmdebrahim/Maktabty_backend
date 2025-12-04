const Joi = require("joi");
const CATEGORIES = require("../constants/categories");
const AppError = require("../helpers/appError");

// ** schema validation
const addBookSchema = Joi.object({
  title: Joi.string().min(3).max(100).required().messages({
    "string.empty": "title is required",
    "string.min": "title must be at least 3 characters long",
    "string.max": "title must be at most 100 characters long",
    "any.required": "title is required",
  }),

  author: Joi.array()
    .items(Joi.string().min(3).max(70))
    .min(1)
    .required()
    .messages({
      "array.base": "author must be an array",
      "array.empty": "author array cannot be empty",
      "string.empty": "author names cannot be empty",
      "string.max": "each author name must be at most 70 characters long",
      "any.required": "author is required",
    }),

  publishedYear: Joi.number()
    .integer()
    .min(1800)
    .max(new Date().getFullYear() + 1)
    .required()
    .messages({
      "number.base": "publishedYear must be a number",
      "number.min": "publishedYear must be at least 1800",
      "number.max": "publishedYear cannot be in the future",
      "any.required": "publishedYear is required",
    }),

  price: Joi.number().positive().min(1).max(10000).required().messages({
    "number.base": "price must be a number",
    "number.positive": "price must be a positive number",
    "number.min": "price must be at least 1 EGP",
    "number.max": "price cannot exceed 10,000 EGP",
    "any.required": "price is required",
  }),

  quantity: Joi.number().integer().min(1).max(100).default(1).messages({
    "number.base": "quantity must be a number",
    "number.min": "you must add at least one copy",
    "number.max": "you can't add more than 100 copies at once",
  }),

  condition: Joi.string()
    .valid("new", "very good", "good", "exellant", "old")
    .default("good")
    .messages({
      "any.only": "condition must be one of: new, very good, good, exellant, old",
    }),

  category: Joi.string().required().messages({
    "string.empty": "category is required",
    "any.required": "category is required",
  }),

  subCategory: Joi.string().optional().messages({
    "string.base": "subCategory must be a string",
  }),

  description: Joi.string().min(10).max(1000).required().messages({
    "string.empty": "description is required",
    "string.min": "description must be at least 10 characters long",
    "string.max": "description must be at most 1000 characters long",
    "any.required": "description is required",
  }),

  images: Joi.string().optional().messages({
    "array.base": "images must be an array",
    "string.uri": "each image must be a valid URL",
  }),
});

// ** to check the validation and throw error to the error handling
const addBookValidation = (req, res, next) => {
  const { error } = addBookSchema.validate(req.body);
  if (error) {
    return next(new AppError(error.message, 400, error.details));
  }
  next();
};

module.exports = addBookValidation;
