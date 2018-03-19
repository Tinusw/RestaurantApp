const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { catchErrors } = require('../handlers/errorHandlers');

// Index
router.get('/', catchErrors(storeController.getStores));

// Stores Section
router.get('/stores', catchErrors(storeController.getStores));

router.get('/stores/:slug', catchErrors(storeController.getStore));

router.get('/add',
  authController.isLoggedIn,
  storeController.addStore
);

router.post('/add',
  authController.isLoggedIn,
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.createStore)
);

router.post('/add/:id',
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.updateStore)
);

// Tags section

router.get('/tags', catchErrors(storeController.getStoresByTag));
router.get('/tags/:tag', catchErrors(storeController.getStoresByTag));

router.get('/stores/:id/edit', catchErrors(storeController.
  editStore));

// User login
router.get('/login', userController.loginForm);
router.post('/login', authController.login)

// to register form
router.get('/register', userController.registerForm);
router.post('/register',
  userController.validateRegister,
  userController.register,
  authController.login
);

router.get('/logout', authController.logout);

router.get('/account',
  authController.isLoggedIn,
  userController.account
);

router.post('/account', catchErrors(userController.updateAccount));

router.post('/account/forgot/', catchErrors(authController.forgot));
router.get('/account/reset/:token', catchErrors(authController.reset));
router.post('/account/reset/:token',
  authController.confirmedPasswords,
  catchErrors(authController.update)
);

module.exports = router;
