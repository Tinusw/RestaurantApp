const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const reviewSchema = new mongoose.Schema({
  created: {
    type: Date,
    default: Date.now
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: "Must supply an author"
  },
  store: {
    type: mongoose.Schema.ObjectId,
    ref: "Store",
    required: "Must supply a store"
  },
  text: {
    type: String,
    required: "You must have text"
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  }
});

// Middleware
function autopopulate(next) {
  this.populate('author');
  next();
}

// Hooks

// Autopopulate user via id automagically
reviewSchema.pre('find', autopopulate);
reviewSchema.pre('findOne', autopopulate)

module.exports = mongoose.model("Review", reviewSchema);
