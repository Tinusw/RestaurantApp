const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const slug = require("slugs");

//
// Schema definition
//

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: "Name cannot be empty"
  },
  slug: String,
  description: {
    type: String,
    trim: true
  },
  tags: [String],
  created_at: {
    type: Date,
    default: Date.now
  },
  location: {
    type: {
      type: String,
      default: "Point"
    },
    coordinates: [
      {
        type: Number,
        required: "Please supply co-ordinates"
      }
    ],
    address: {
      type: String,
      required: "Please supply an address"
    }
  },
  photo: {
    type: String
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: 'author must be supplied'
  }
}, {
  // by default virtual attributes aren't displayed unless called explicitly
  // this takes care of that
  toJSON: { virtuals: true },
  toObject: {virtuals: true},
});

//
// MongoDB Index Definition
//

storeSchema.index({
  name: 'text',
  description: 'text'
});

storeSchema.index({
  location: '2dsphere'
});

//
// Hooks
//

storeSchema.pre("save", async function(next) {
  // only change slug if name is modified
  // Todo -> ensure uniqueness
  if (!this.isModified("name")) {
    return next();
  }
  this.slug = slug(this.name);

  // Find other stores by slug so we can keep them unique
  const slugRegex = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, "i");
  // constructor allows us to access the DB inside of it's schema call
  const storesWithSlug = await this.constructor.find({
    slug: slugRegex
  });

  // If match is found then add an increment based on how many matches are found
  if (storesWithSlug.length) {
    this.slug = `${this.slug}-${storesWithSlug.length + 1}`;
  }

  next();
});

//
// TODO
// Sanitize input data to strip html content!!!
//

//
// Model methods
//
storeSchema.statics.getTagsList = function() {
  return this.aggregate(
    [
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ],
    function(err, result) {
      if (err) {
        console.log(err);
        return;
      }
    }
  );
};

storeSchema.statics.getTopStores = function() {
  return this.aggregate([
    { $lookup: {
      from: 'reviews', localField: '_id', foreignField: 'store', as: 'reviews'}
    },
    { $match: {
      'reviews.1': { $exists: true } }
    },
    { $addFields: {
      averageRating: { $avg: '$reviews.rating' } }
    },
    {
      $project : {
        averageRating: true,
        photo: '$$ROOT.photo',
        name: '$$ROOT.name',
        reviews: '$$ROOT.reviews',
        slug: '$$ROOT.slug'
      }
    },
    {
      $sort: {
        averageRating: -1
      }
    },
    {
      $limit: 10
    }
  ])
}

// Virtual attribute to attach reviews via the store_id field on the reviews model
storeSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'store'
});

module.exports = mongoose.model("Store", storeSchema);
