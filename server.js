// 🔹 Step 1: dotenv sabse upar
const dotenv = require("dotenv");
dotenv.config();

// 🔹 Step 2: Required modules
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const connectDB = require("./config/db"); // MongoDB connect
require("./config/passport"); // Google strategy

// 🔹 Step 3: Connect to MongoDB
connectDB();

const app = express();

// 🔹 Step 4: Middleware
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(passport.initialize()); // ✅ session-free

// 🔹 Step 5: Voice API routes
const voiceRoutes = require("./routes/voiceRoutes");
app.use("/api/voice", voiceRoutes);

// 🔹 Step 6: Google OAuth routes

// Start Google login
app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

// Callback after Google login
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    const user = req.user;

    const redirectBase =
      process.env.NODE_ENV === "production"
        ? process.env.GOOGLE_REDIRECT_AFTER_LOGIN
        : "http://localhost:5173";

    if (!redirectBase) {
      return res.status(500).send("Redirect URL not configured");
    }

    // 🔹 Generate JWT token
    const token = require("jsonwebtoken").sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 🔹 Build redirect URL with token
    const redirectURL = `${redirectBase}/auth/google/callback?token=${token}&name=${encodeURIComponent(
      user.name
    )}&email=${encodeURIComponent(user.email)}&_id=${user._id}`;

    res.redirect(redirectURL);
  }
);

// 🔹 Step 7: Test route
app.get("/", (req, res) => res.send("Voice API Running..."));

// 🔹 Step 8: Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
