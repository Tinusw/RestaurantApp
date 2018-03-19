const passport = require('passport')
const crypto = require('crypto')
const mongoose = require('mongoose');
const User = mongoose.model('User');

//
// Middleware
//

exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Failed login!',
  successRedirect: '/',
  successFlash: 'You are now logged in!',
});

exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'logged out');
  res.redirect('/');
};


exports.isLoggedIn = (req, res, next) => {
  // Check if authenticated using passport
  if(req.isAuthenticated()) {
    next();
    return;
  }
  req.flash('error', 'please log in to add a store');
  res.redirect('/login');
};

exports.forgot = async (req, res) => {
  // Find User
  const user = await User.findOne({
    email: req.body.email
  });

  if(!user){
    req.flash('error', 'A password was sent to your account (no email account found)');
    return res.redirect('/login')
  }
  // Create Token & set expiry an hour from now
  user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordExpires = Date.now() + 3600000;
  await user.save();
  // Send/Fire Token
  const resetUrl = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;
  req.flash('success', `been emailed a password ${resetUrl}`)
  res.redirect('/login');
  // Rest PW
};
