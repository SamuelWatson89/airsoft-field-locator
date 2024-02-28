const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const slug = require("slugs");

const fieldSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: "Please enter a field name.",
  },
  slug: String,
  description: {
    type: String,
    trim: true,
  },
  created: {
    type: Date,
    default: Date.now,
  },
  location: {
    type: {
      type: String,
      default: "Point",
    },
    coordinates: [
      {
        type: Number,
        required: "You must supply coordinates",
      },
    ],
    address: {
      type: String,
      required: "You must supply an address",
      trim: true,
    },
    region: {
      type: String,
      trim: true,
    },
  },
  prices: {
    walkOn: {
      type: Number,
    },
    rental: {
      type: Number,
    },
  },
  siteType: [String],
  gameTypes: [String],
  facilities: [String],
  powerLimits: {
    aeg: {
      fps: {
        type: Number,
      },
      joules: {
        type: Number,
      },
    },
    dmr: {
      fps: Number,
      joules: Number,
    },
    bolt: {
      fps: Number,
      joules: Number,
    },
    shotgun: {
      fps: Number,
      joules: Number,
    },
  },
  onlineBooking: {
    type: Boolean,
    default: false,
  },
  ukaraStatus: {
    type: Boolean,
    default: false,
  },
  bioBb: {
    type: Boolean,
    default: false,
  },
  pyro: {
    type: Boolean,
    default: false,
  },
  tagg: {
    type: Boolean,
    default: false,
  },
  launcher: {
    type: Boolean,
    default: false,
  },
  website: {
    type: String,
    trim: true,
  },
  contactNumber: {
    type: String,
    trim: true,
  },
  socials: {
    instagram: {
      type: String,
      trim: true,
    },
    facebook: {
      type: String,
      trim: true,
    },
    twitter: {
      type: String,
      trim: true,
    },
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: "You must supply and author",
  },
});

// Define indexes
fieldSchema.index({
  name: "text",
  description: "text",
  "location.address": "text",
  "location.region": "text",
});

fieldSchema.pre("save", async function (next) {
  if (!this.isModified("name")) {
    next();
    return;
  }
  this.slug = slug(this.name);
  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, "i");

  const fieldsWithSlug = await this.constructor.find({ slug: slugRegEx });

  if (fieldsWithSlug.length) {
    this.slug = `${this.slug}-${fieldsWithSlug.length + 1}`;
  }

  next();
});

module.exports = mongoose.model("Field", fieldSchema);
