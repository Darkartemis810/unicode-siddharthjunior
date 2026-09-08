const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Note = require("../models/Note");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

// Upload folder
const uploadDir = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  }
});

// Allowed file types
const fileFilter = (req, file, cb) => {
  const allowedDocTypes = [
    ".pdf",
    ".ppt",
    ".pptx",
    ".doc",
    ".docx"
  ];
  const allowedImageTypes = [
    ".png",
    ".jpg",
    ".jpeg",
    ".webp"
  ];

  const extension = path.extname(file.originalname).toLowerCase();

  if (file.fieldname === "coverImage") {
    if (allowedImageTypes.includes(extension)) {
      cb(null, true);
    } else {
      cb(new Error("Cover image must be a PNG, JPG, JPEG, or WEBP file"), false);
    }
    return;
  }

  if (allowedDocTypes.includes(extension)) {
    cb(null, true);
  } else {
    cb(
      new Error("Only PDF, PPT, PPTX, DOC and DOCX files are allowed"),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

// GET approved notes
router.get("/", async (req, res) => {
  try {
    const notes = await Note.find({
      verificationStatus: "Approved"
    })
      .sort({ createdAt: -1 })
      .populate("uploadedBy", "name email college");

    res.json(notes);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch notes",
      error: error.message
    });
  }
});

// GET pending notes — Faculty/Admin use
router.get("/pending", async (req, res) => {
  try {
    const notes = await Note.find({
      verificationStatus: "Pending"
    })
      .sort({ createdAt: -1 })
      .populate("uploadedBy", "name email college");

    res.json(notes);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch pending notes",
      error: error.message
    });
  }
});

// Upload note
router.post("/upload", authMiddleware, upload.fields([
  { name: "document", maxCount: 1 },
  { name: "file", maxCount: 1 },
  { name: "coverImage", maxCount: 1 }
]), async (req, res) => {
  try {
    const uploadedFile = req.files?.document?.[0] || req.files?.file?.[0];
    if (!uploadedFile) {
      return res.status(400).json({
        message: "Please upload a valid file"
      });
    }

    const coverFile = req.files?.coverImage?.[0];
    const coverImagePath = coverFile ? `/uploads/${coverFile.filename}` : "";

    const note = new Note({
      title: req.body.title,
      subject: req.body.subject,
      semester: req.body.semester,
      unit: req.body.unit,
      topic: req.body.topic,
      college: req.body.college,
      description: req.body.description,

      uploadedBy: req.user.userId,
      uploaderName: req.body.uploaderName || "Student",

      fileName: uploadedFile.originalname,
      filePath: uploadedFile.path,
      coverImage: coverImagePath,
      fileType: uploadedFile.mimetype,
      fileSize: uploadedFile.size,

      verificationStatus: "Pending"
    });

    await note.save();

    res.status(201).json(note);
  } catch (error) {
    console.error("Note upload error:", error);
    res.status(500).json({
      message: "Note upload failed",
      error: error.message
    });
  }
});

// Grant access to an approved note and return its download URL.
router.get("/:id/access", authMiddleware, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });
    if (note.verificationStatus !== "Approved") {
      return res.status(403).json({ message: "This note is not verified yet" });
    }
    note.downloads += 1;
    note.views += 1;
    await note.save();
    res.json({ downloads: note.downloads, downloadUrl: `/api/notes/${note.id}/download` });
  } catch (error) {
    console.error("Note access error:", error);
    res.status(500).json({ message: "Could not access note" });
  }
});

router.post("/:id/rate", authMiddleware, async (req, res) => {
  try {
    const rating = Number(req.body.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });
    if (note.ratings.some(item => String(item.user) === String(req.user.userId))) {
      return res.status(409).json({ message: "You have already rated this note" });
    }
    note.ratings.push({ user: req.user.userId, value: rating });
    note.averageRating = Number((note.ratings.reduce((sum, item) => sum + item.value, 0) / note.ratings.length).toFixed(1));
    await note.save();
    res.json({ rating: note.averageRating, ratingsCount: note.ratings.length });
  } catch (error) {
    console.error("Note rating error:", error);
    res.status(500).json({ message: "Could not rate note" });
  }
});

// Download approved note
router.get("/:id/download", async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        message: "Note not found"
      });
    }

    if (note.verificationStatus !== "Approved") {
      return res.status(403).json({
        message: "This note is not verified yet"
      });
    }

    if (!fs.existsSync(note.filePath)) {
      return res.status(404).json({
        message: "File not found on server"
      });
    }

    note.downloads += 1;
    note.views += 1;

    await note.save();

    res.download(note.filePath, note.fileName);
  } catch (error) {
    res.status(500).json({
      message: "Download failed",
      error: error.message
    });
  }
});

// Report note
router.post("/:id/report", async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        message: "Note not found"
      });
    }

    note.reports += 1;
    note.isReported = true;

    await note.save();

    res.json({
      message: "Note reported successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Report failed",
      error: error.message
    });
  }
});

module.exports = router;