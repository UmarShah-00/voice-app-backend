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
const allowedOrigins = [
  "http://localhost:5173",
  "https://voice-app-frontend.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(passport.initialize()); // ✅ session-free

// 🔹 Step 5: Voice API routes
const voiceRoutes = require("./routes/voiceRoutes");
app.use("/api/voice", voiceRoutes);

// 🔹 Step 6: Google OAuth routes

// Start Google login
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"], prompt: "select_account" })
);

// Callback after Google login
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  (req, res) => {
    if (!req.user) return res.status(401).send("Login failed");

    const jwt = require("jsonwebtoken");
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    // Redirect to frontend with token
    const redirectURL = `${process.env.GOOGLE_REDIRECT_AFTER_LOGIN}/auth/google/callback?token=${token}&name=${encodeURIComponent(
      req.user.name
    )}&email=${encodeURIComponent(req.user.email)}`;

    res.redirect(redirectURL);
  }
);

// 🔹 Step 7: Test route
app.get("/", (req, res) => res.send("Voice API Running..."));

// 🔹 Step 8: Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
