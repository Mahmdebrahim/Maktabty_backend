const express = require("express");
const router = express.Router();
const authMW = require("../middlewares/auth.js");
const {
  loginValidation,
  signupValidation,
} = require("../middlewares/authvalidation");
const {
  login,
  signUp,
  logout
} = require("../controllers/authControllers");
const { 
  getMyProfile,
  updateMyProfile
} = require("../controllers/userController") 



// ?? registeration render UI
router.get("/new/user", (req, res) => {
  res.render("register");
});
router.get("/login/user", (req, res) => {
  res.render("login");
});

// ?? registeration Logic
router.post("/auth/register", signupValidation,signUp );
// ?? login Logic
router.post("/auth/login", loginValidation, login);
// ?? logout
router.post("/auth/logout", authMW,logout);

// ** get user by id
router.get("/auth/profile", authMW, getMyProfile);

// ** update a user
router.patch("/auth/profile", authMW, updateMyProfile);









// router.put("/:userId", async (req, res) => {
//   UserModel.findByIdAndUpdate(req.params.userId, req.body, { new: true })
//     .then((updatedUser) => {
//       res.status(200).json(updatedUser);
//     })
//       res.status(500).send("Error updating user: " + err);
// });

//! delete a user
// router.delete("/:userId", (req, res) => {
//   UserModel.findByIdAndDelete(req.params.userId)
//     .then((deletedUser) => {
//       res.status(200).json(deletedUser);
//     })
//     .catch((err) => {
//       res.status(500).send("Error deleting user: " + err);
//     });
// });

module.exports = router;
