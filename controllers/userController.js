const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');

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
};

exports.registerForm = (req, res) => {
  res.render('register', { title: 'register' })
};

exports.register = async (req, res, next) => {
  const user = new User({
    email: req.body.email,
    name: req.body.name,
  });

  // mongoose-passport password generator stuff
  // unfortunately register method doesn't support promises yet, hence the use of promisefy
  // https://github.com/jaredhanson/passport/issues/536
  const registerWithPromisefy = promisify(User.register, User);
  await registerWithPromisefy(user, req.body.password);
  next();
};

exports.account = (req, res) => {
  res.render('account', { title: 'Edit your account' });
}

exports.updateAccount = async (req, res) => {
  const updates = {
    name: req.body.name,
    email: req.body.email,
  }
  const user = await User.findOneAndUpdate(
    { _id: req.user._id },
    { $set: updates },
    { new: true, runValidator: true, context: 'query' }
  )
  req.flash('success', 'Profile Updated!');
  res.redirect('back');
}
