const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const noteRoutes = require("./routes/noteRoutes");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const resourceRoutes = require("./routes/resourceRoutes");
const teamRoutes = require("./routes/teamRoutes");

const app = express();


// ================= MIDDLEWARE =================

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// ================= BASIC TEST ROUTE =================

app.get("/", (req, res) => {
  res.json({
    message: "UniTrade Backend is running successfully 🚀"
  });
});


// ================= AUTH & PRODUCT ROUTES =================

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/listings", productRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/team", teamRoutes);

// ================= MONGODB CONNECTION =================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {

    console.log("MongoDB connected successfully ✅");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(
        `UniTrade Backend running on http://localhost:${PORT}`
      );
    });

  })
  .catch((error) => {

    console.error("MongoDB connection failed ❌");
    console.error(error.message);

  });