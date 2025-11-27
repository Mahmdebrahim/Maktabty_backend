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

  author: Joi.string().min(3).max(70).required().messages({
    "string.empty": "author is required",
    "string.min": "author must be at least 3 characters long",
    "string.max": "author must be at most 70 characters long",
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
    .valid("new", "like new", "very good", "good", "acceptable")
    .default("good")
    .messages({
      "any.only":
        "condition must be one of: new, like new, very good, good, acceptable",
    }),

  category: Joi.string()
    .valid(...CATEGORIES.map((category) => category.value))
    .required()
    .messages({
      "any.only": "must be a valid category",
      "any.required": "category is required",
    }),

  description: Joi.string().min(10).max(1000).required().messages({
    "string.empty": "description is required",
    "string.min": "description must be at least 10 characters long",
    "string.max": "description must be at most 1000 characters long",
    "any.required":"description is required",
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