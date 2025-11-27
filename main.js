//////////////////////////////todoMal3aby//////////////////////////////////////
const express = require('express');
const userRoutes = require('./routes/users.js');
const bookRoutes = require('./routes/book.js');
const favoritesRoutes = require("./routes/favorites.js");
const cartRoutes = require("./routes/cart.js");
const errorMiddleWare = require('./middlewares/error.js');
const cookieParser = require("cookie-parser");

const app = express();
exports.app = app;
const port = 5000;

const connectDB = require('./config/db.js');

app.set('view engine', 'ejs');

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/users', userRoutes);
app.use('/books', bookRoutes);
app.use("/favorites", favoritesRoutes);
app.use("/cart", cartRoutes);

app.use(errorMiddleWare.handle);

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
