const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    subject: {
      type: String,
      required: true,
      trim: true
    },

    semester: {
      type: String,
      required: true
    },

    unit: {
      type: String,
      default: ""
    },

    topic: {
      type: String,
      default: ""
    },

    college: {
      type: String,
      default: ""
    },

    description: {
      type: String,
      default: ""
    },

    // Student who uploaded the note
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    uploaderName: {
      type: String,
      default: ""
    },

    // Uploaded file information
    fileName: {
      type: String,
      required: true
    },

    filePath: {
      type: String,
      required: true
    },

    coverImage: {
      type: String,
      default: ""
    },

    fileType: {
      type: String,
      default: ""
    },

    fileSize: {
      type: Number,
      default: 0
    },

    // Faculty verification
    verificationStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending"
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    verifiedAt: {
      type: Date,
      default: null
    },

    rejectionReason: {
      type: String,
      default: ""
    },

    // Engagement
    downloads: {
      type: Number,
      default: 0
    },

    views: {
      type: Number,
      default: 0
    },

    ratings: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },

        value: {
          type: Number,
          min: 1,
          max: 5
        },

        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ],

    averageRating: {
      type: Number,
      default: 0
    },

    // Reports / moderation
    reports: {
      type: Number,
      default: 0
    },

    isReported: {
      type: Boolean,
      default: false
    },

    isFeatured: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Note", noteSchema);