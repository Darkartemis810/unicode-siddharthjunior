const express = require("express");
const multer = require("multer");
const path = require("path");
const TeamMember = require("../models/TeamMember");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();
const upload = multer({ dest: path.join(__dirname, "../uploads") });

router.get("/", async (req, res) => {
  try {
    res.json(await TeamMember.find().sort({ createdAt: -1 }));
  } catch (error) {
    console.error("Fetch team profiles error:", error);
    res.status(500).json({ message: "Failed to fetch team profiles" });
  }
});

router.post("/", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const skills = String(req.body.skills || "")
      .split(",")
      .map(skill => skill.trim())
      .filter(Boolean);
    const member = await TeamMember.create({
      name: req.body.name,
      role: req.body.role,
      skills,
      experience: req.body.experience,
      status: req.body.status,
      about: req.body.about,
      college: req.body.college,
      email: req.body.email,
      phone: req.body.phone,
      cgpa: req.body.cgpa,
      image: req.file ? `/uploads/${req.file.filename}` : "",
      user: req.user.userId
    });
    res.status(201).json(member);
  } catch (error) {
    console.error("Create team profile error:", error);
    res.status(400).json({ message: "Failed to create team profile" });
  }
});

module.exports = router;
