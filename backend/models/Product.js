const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      default: ""
    },

    category: {
      type: String,
      default: "Other"
    },

    price: {
      type: Number,
      required: true,
      min: 0
    },

    condition: {
      type: String,
      default: "Good"
    },

    image: {
      type: String,
      default: ""
    },

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    sellerName: {
      type: String,
      default: ""
    },

    college: {
      type: String,
      default: ""
    },

    contact: {
      type: String,
      default: ""
    },

    status: {
      type: String,
      enum: ["Available", "Reserved", "Sold"],
      default: "Available"
    },

    isVerifiedSeller: {
      type: Boolean,
      default: false
    },

    isBoosted: {
      type: Boolean,
      default: false
    },

    views: {
      type: Number,
      default: 0
    },

    wishlistCount: {
      type: Number,
      default: 0
    },

    reports: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Product", productSchema);