const passport = require('passport')

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


exports.isLoggedIn = (req, res) => {
  // Check if authenticated using passport
  if(req.isAuthenticated()) {
    next();
    return;
  }
  req.flash('error', 'please log in to add a store');
  res.redirect('/login');
};
