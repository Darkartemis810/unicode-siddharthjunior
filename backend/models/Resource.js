const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, default: "PYQs" },
    subject: { type: String, required: true, trim: true },
    type: { type: String, default: "PDF" },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    downloads: { type: Number, default: 0 },
    verified: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resource", resourceSchema);
