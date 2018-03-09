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
  }
});

storeSchema.pre('save', function(next) {
  // only change slug if name is modified
  // Todo -> ensure uniqueness
  if (!this.isModified('name')) {
    return next();
  }
  this.slug = slug(this.name);
  next();
})

module.exports = mongoose.model('Store', storeSchema);
