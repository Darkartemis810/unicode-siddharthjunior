const express = require("express");
const multer = require("multer");
const path = require("path");
const Resource = require("../models/Resource");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();
const upload = multer({ dest: path.join(__dirname, "../uploads") });

router.get("/", async (req, res) => {
  try {
    res.json(await Resource.find().sort({ createdAt: -1 }));
  } catch (error) {
    console.error("Fetch resources error:", error);
    res.status(500).json({ message: "Failed to fetch resources" });
  }
});

router.post("/", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const resource = await Resource.create({
      title: req.body.title,
      category: req.body.category,
      subject: req.body.subject,
      type: req.body.type,
      description: req.body.description,
      image: req.file ? `/uploads/${req.file.filename}` : "",
      createdBy: req.user.userId
    });
    res.status(201).json(resource);
  } catch (error) {
    console.error("Create resource error:", error);
    res.status(400).json({ message: "Failed to create resource" });
  }
});

module.exports = router;
