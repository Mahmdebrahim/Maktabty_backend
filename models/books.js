const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    maxlength: 2000,
  },
  author: {
    type: [String],
    required: true,
  },
  publishedYear: {
    type: Number,
    required: true,
    min: 1000,
    max: new Date().getFullYear() + 5,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  images:{
    type:String,
  },
  condition: {
    type: String,
    enum: ["good","very good","new","exellant","old"],
    default: "good",
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  subCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  },
  isSoldOut: {
    type: Boolean,
    default: false,
  },
  soldCount: {
    type: Number,
    default: 0,
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  
},
{
  timestamps: true,
});

const Book = mongoose.model('Book', bookSchema);
module.exports = Book;  