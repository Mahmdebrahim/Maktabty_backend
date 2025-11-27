const joi = require("joi");
const AppError = require("../helpers/appError.js");

const loginSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().min(5).max(20).required(),
});

const signSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().min(5).max(20).required(),
  username: joi.string().min(5).max(20).required(),
  phone: joi.string().min(5).max(20).required(),
  role: joi.string().valid("seller", "admin", "user").default("user"),
});

const signupValidation = (req,res,next) =>{
   const {error} =  signSchema.validate(req.body)
   if (error) {
     return next(new AppError(error.message,400,error.details))
   }
   next();
}

const loginValidation = (req,res,next) =>{
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return next(new AppError(error.message, 400, error.details));
    }
    next();
}

module.exports = {
  signupValidation,
  loginValidation,
};