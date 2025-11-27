const AppError = require("../helpers/appError");
const UserModel = require("../models/users");

const isSeller = async (req, res, next) => {
    const user = await UserModel.findById(req.user.userId)
    if(!user){
        return next(new AppError("User not found",404))
    }
    if (user.role !== "seller") {
        return next(new AppError("You are not authorized to access this resource",403))
    }
  next();
};

module.exports = isSeller;
