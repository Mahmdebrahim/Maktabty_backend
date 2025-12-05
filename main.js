//////////////////////////////todoMal3aby//////////////////////////////////////
const express = require("express");
const userRoutes = require("./routes/users.js");
const bookRoutes = require("./routes/book.js");
const favoritesRoutes = require("./routes/favorites.js");
const cartRoutes = require("./routes/cart.js");
const orderRoutes = require("./routes/order.js");
const categoriesRoutes = require("./routes/categories.js");
const adminRoutes = require("./routes/admin.js");
const reviewRoutes = require("./routes/review.js");
const errorMiddleWare = require("./middlewares/error.js");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const app = express();
exports.app = app;
const port = 5000;

const connectDB = require("./config/db.js");
app.set("view engine", "ejs");

// Serve static files from public folder
//!!
app.use(express.static("public"));

app.use(morgan("combined"));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/users", userRoutes);
app.use("/books", bookRoutes);
app.use("/favorites", favoritesRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);
app.use("/categories", categoriesRoutes);
app.use("/admin", adminRoutes);
app.use("/reviews", reviewRoutes);

app.use(errorMiddleWare);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
