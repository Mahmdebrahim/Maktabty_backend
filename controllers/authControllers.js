const UserModel = require("../models/users.js");
const AppError = require("../helpers/appError.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


// ** singUp contoroller to create a new user
const signUp = async (req, res, next) => {
  const { username, password, email, phone, role } = req.body;
  if (!email || !password || !username) {
    return next(new AppError("Email, password, and username are required", 400));
  }

  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    return next(new AppError("Email is already in use", 400));
  }

  const user = await UserModel.create({
    username,
    password,
    email,
    phone,
    role,
  });

  res.status(201).send(user);

  if (!user) {
    return next(new AppError("Invalid email or password", 401));
  }

};

// ** login contoroller to login a new user
const login = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email }).select("+password");
  if (!user) {
    return next(new AppError("Invalid email or password", 401));
  }
  const ValidPassword = await bcrypt.compare(password, user.password);
  if (!ValidPassword) {
    return next(new AppError("Invalid email or password", 401));
  }
  const token = jwt.sign(
    { userId: user._id, username: user.username },
    "secretKey"
  );
  res.cookie("token", token, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: "strict",
  });
  
  user.password = undefined;
  res.send({user,tokem:token});
};

// ** logout contoroller to logout a user
const logout = async (req, res) => {
  res.clearCookie("token");
  res.send("Logged out successfully");
};

module.exports = { signUp, login, logout };
