const UserModel = require("../models/users.js");

const getMyProfile = async (req, res, next) => {
  const user = await UserModel.findById(req.user.userId);
  if (!user) {
    return next(new AppError(" User not found", 404));
  }
  res.status(200).json(user);
};

const updateMyProfile = async (req, res, next) => {
  const user = await UserModel.findByIdAndUpdate(req.user.userId, req.body, {
    $set: req.body,
    new: true,
  });
  if (!user) {
    return next(new AppError(" User not found", 404));
  }
  res.status(200).json(user);
};

// const changeMyPassword = async (req, res, next) => {
//   const user = await UserModel.findById(req.user.userId);
//   if (!user) {
//     return next(new AppError(" User not found", 404));
//   }
//   const isMatch = await bcrypt.compare(req.body.currentPassword, user.password);

//   if (!isMatch) {
//     return next(new AppError(" Current password is incorrect", 400));
//   }
//   user.password = req.body.newPassword;

//   await user.save();
//   res.status(200).json({ message: " Password changed successfully" });
// };


module.exports = {
  getMyProfile,
  updateMyProfile,
};
