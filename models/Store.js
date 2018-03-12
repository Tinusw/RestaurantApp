const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: 'Name cannot be empty'
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
      default: 'Point'
    },
    coordinates: [{
      type: Number,
      required: 'Please supply co-ordinates'
    }],
    address: {
      type: String,
      required: 'Please supply an address'
    }
  },
  photo: {
    type: String
  }
});

storeSchema.pre('save', async function(next) {
  // only change slug if name is modified
  // Todo -> ensure uniqueness
  if (!this.isModified('name')) {
    return next();
  }
  this.slug = slug(this.name);

  // Find other stores by slug so we can keep them unique
  const slugRegex = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
  // constructor allows us to access the DB inside of it's schema call
  const storesWithSlug = await this.constructor.find({
    slug: slugRegex
  });

  // If match is found then add an increment based on how many matches are found
  if(storesWithSlug.length){
    this.slug = `${this.slug}-${storesWithSlug.length + 1}`
  }

  next();
})

module.exports = mongoose.model('Store', storeSchema);
