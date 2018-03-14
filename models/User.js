const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
const md5 = require('md5');
const validator = require('validator');
const mongodbErrorHandler = require('mongoose-mongodb-errors');
const passport = require('passport-local-mongoose');

//
// Schema definition
//

const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Email is invalid :('],
    required: 'Please add an email address'
  },
  name: {
    type: String,
    required: 'Please add a name',
    trim: true
  }
});

// Middleware to add authentication via passport.js
userSchema.plugin(passport, { usernameField: 'email' });
userSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model('User', userSchema);