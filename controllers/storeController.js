const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const multer = require('multer')
const jimp = require('jimp')
const uuid = require('uuid')

// config for multer image uploads
const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith('image/');
    // passing null/true
    // null says no error message, true says continue
    if(isPhoto) {
      next(null, true)
    } else {
      next({
        messsage: 'Bad file format/type'
      }, false);
    }
  }
}

// Index
exports.homePage = (req, res) => {
  res.render('index')
};

// New
exports.addStore = (req, res) => {
  res.render('editStore', { title: 'Add Store' })
};

// middleWare for create
// tells middleware to look for a single field for uploads
exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
  // only run if there is something to resize
  console.log(req.file)
  if (!req.file) {
    next();
    return;
  }
  console.log(req.file)
}

// Create
exports.createStore = async (req, res) => {
  const store = await (new Store(req.body)).save();
  req.flash('success', `Successfully Created ${store.name}.`)
  res.redirect(`/store/${store.slug}`);
};

// Index
exports.getStores = async (req, res) => {
  const stores = await Store.find();
  res.render('stores', { title: 'Stores', stores });
}

// Show
exports.getStore = async (req, res) => {
  const store = await Store.findOne({slug: req.params.slug});
  res.render('show', { title: 'Stores', store });
}

// Edit
exports.editStore = async (req, res) => {
  const store = await Store.findOne({_id: req.params.id});
  res.render('editStore', { title: `Edit ${store.name}`, store });
}

// Update
exports.updateStore = async (req, res) => {
  // ensure location is a value type of point
  // mongoDB issue
  req.body.location.type = 'Point'

  const store = await Store.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true,
    runValidators: true
  }).exec();
  req.flash('succes', `Successfully updated ${store.name}. <a href="/stores/${store.slug}">View Store</a>`);
  res.redirect(`/stores/${store._id}/edit`);
}
