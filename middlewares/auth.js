const jwt = require('jsonwebtoken');
const AppError = require('../helpers/appError');

const authMW = function (req, res, next) {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res
        .status(401)
        .json({ message: "You are not logged in (no token provided)." });
    }
    jwt.verify(token,"secretKey", (err, user) => {
      if (err) {
        return res.status(403).json({ error: "Token not valid !" });
      }
      // to access the user from request
      req.user = user
      req.token = token;
      next();
    });
  } catch (err) {
      return next(new AppError("Invalid or expired token.", 401));
  }
}


module.exports = authMW;