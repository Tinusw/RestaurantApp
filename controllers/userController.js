const mongoose = require('mongoose');

//
// Middleware
//

// Express Validator
exports.validateRegister = (req, res, next) => {
  req.sanitizeBody('name');
  req.checkBody('name', 'You must supply a name').notEmpty();
  req.checkBody('email', 'Email address invalid').isEmail();
  req.sanitizeBody('email').normalizeEmail();
  req.checkBody('password', 'Password cannot be blank').notEmpty();
  req.checkBody('password-confirm', 'password confirm cannot be blank').notEmpty();
  req.checkBody('password-confirm', 'Password and confirmation do not match :(').equals(req.body.password);

  // Collect errors, flash and pass body back
  const errors = req.validationErrors();
  if(errors) {
    req.flash('error', errors.map(err => err.msg));
    res.render('register', {
      title: 'register',
      body: req.body,
      flashes: req.flash()
    });
    return;
  }
  next();
};

// Actions
exports.loginForm = (req, res) => {
  res.render('login', { title: 'Login'} )
}

exports.registerForm = (req, res) => {
  console.log('validated')
  res.render('register', { title: 'register' })
}
