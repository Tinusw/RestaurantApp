const mongoose = require("mongoose");
const Store = mongoose.model("Store");
const User = mongoose.model("User");
const multer = require("multer");
const jimp = require("jimp");
const uuid = require("uuid");

//
// Middleware
//

// config for multer image uploads
const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith("image/");
    // passing null/true
    // null says no error message, true says continue
    if (isPhoto) {
      next(null, true);
    } else {
      next(
        {
          messsage: "Bad file format/type"
        },
        false
      );
    }
  }
};

//
// Controller actions
//

// Index
exports.homePage = (req, res) => {
  res.render("index");
};

// New
exports.addStore = (req, res) => {
  res.render("editStore", { title: "Add Store" });
};

// middleWare for create
// tells middleware to look for a single field for uploads
exports.upload = multer(multerOptions).single("photo");

exports.resize = async (req, res, next) => {
  // only run if there is something to resize
  if (!req.file) {
    next();
    return;
  }
  const extension = req.file.mimetype.split("/")[1];
  req.body.photo = `${uuid.v4()}.${extension}`;

  // Time to resize & save
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO);
  await photo.write(`./public/uploads/${req.body.photo}`);
  next();
};

// Create
exports.createStore = async (req, res) => {
  req.body.author = req.user._id;
  const store = await new Store(req.body).save();
  req.flash("success", `Successfully Created ${store.name}.`);
  res.redirect(`/store/${store.slug}`);
};

// Index
exports.getStores = async (req, res) => {
  const stores = await Store.find();
  res.render("stores", { title: "Stores", stores });
};

// Show
exports.getStore = async (req, res, next) => {
  const store = await Store.findOne({ slug: req.params.slug }).populate(
    "author reviews");
  // check if record exists
  if (!store) {
    return next();
  }

  res.render("show", { title: `${store.name}`, store });
};

// show/filter by tag if present
exports.getStoresByTag = async (req, res) => {
  const tag = req.params.tag;

  const tagQuery = tag || { $exists: true };
  const tagsPromise = Store.getTagsList();
  const storesPromise = Store.find({
    tags: tagQuery
  });

  // Await multiple promises using .all and immediately store in two consts
  const [tags, stores] = await Promise.all([tagsPromise, storesPromise]);
  res.render("tag", {
    tags,
    title: tag,
    stores
  });
};

const confirmOwner = (store, user) => {
  if (!store.author || !store.author.equals(user._id)) {
    return false;
  }
  return true;
};

// Edit
exports.editStore = async (req, res) => {
  const store = await Store.findOne({ _id: req.params.id });
  if (!confirmOwner(store, req.user)) {
    req.flash("error", "cannot edit store as you are not the owner");
    res.redirect("/");
  }
  res.render("editStore", { title: `Edit ${store.name}`, store });
};

// Update
exports.updateStore = async (req, res) => {
  // ensure location is a value type of point
  // mongoDB issue
  req.body.location.type = "Point";

  const store = await Store.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true,
    runValidators: true
  }).exec();
  req.flash(
    "succes",
    `Successfully updated ${store.name}. <a href="/stores/${
      store.slug
    }">View Store</a>`
  );
  res.redirect(`/stores/${store._id}/edit`);
};

exports.searchStores = async (req, res) => {
  const stores = await Store.find(
    {
      $text: {
        $search: req.query.q
      }
    },
    {
      score: { $meta: "textScore" }
    }
  )
    .sort({
      score: { $meta: "textScore" }
    })
    .limit(5);
};

exports.mapStores = async (req, res) => {
  const cooridnates = [req.query.lng, req.query.lat].map(parseFloat);
  const query = {
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: cooridnates
        },
        // Find in 10km range
        $maxDistance: 10000
      }
    }
  };
  const stores = await Store.find(query)
    .select("slug name description location photo")
    .limit(10);
  res.json(stores);
};

exports.mapPage = (req, res) => {
  res.render('map', {title: 'Map'})
}

exports.heartStore = async (req, res) => {
  const hearts = req.user.hearts.map(obj => obj.toString());
  // If store heart exists we need to remove obj from array else we add to array
  const operator = hearts.includes(req.params.id) ? `$pull` : '$addToSet';
  const user = await User
    .findByIdAndUpdate(req.user._id, {
      [operator]: { hearts: req.params.id } },
      // we add new to return the updated user
      { new: true }
    );
  res.json(user)
}

exports.getHearts = async (req, res) => {
  const stores = await Store.find({
    _id: { $in: req.user.hearts }
  });
  res.render('stores', { title: 'hearted stores', stores})
}
