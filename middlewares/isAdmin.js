const AppError = require("../helpers/appError.js");
const UserModel = require("../models/users.js");

const isAdmin = async(req, res, next) => {
  const user = await UserModel.findById(req.user.userId)
  if (!req.user) {
    return next(new AppError("Unauthorized", 401));
  }
  if (user.role !== "admin") {
    return next(new AppError("Access denied", 403));
  }
  next();
};

module.exports = isAdmin;