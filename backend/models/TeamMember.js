const mongoose = require("mongoose");

const teamMemberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, default: "Coder" },
    skills: { type: [String], default: [] },
    experience: { type: String, default: "" },
    rating: { type: Number, default: 0 },
    status: { type: String, default: "Available" },
    verified: { type: Boolean, default: true },
    about: { type: String, default: "" },
    college: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    cgpa: { type: String, default: "" },
    image: { type: String, default: "" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("TeamMember", teamMemberSchema);
