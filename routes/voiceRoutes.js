const express = require("express");
const VoiceText = require("../models/VoiceText");
const fetch = require("node-fetch");
const router = express.Router();

// SAVE VOICE TEXT
router.post("/save", async (req, res) => {
  try {
    const { text, language } = req.body;

    const savedText = await VoiceText.create({
      text,
      language,
    });

    res.status(201).json({
      success: true,
      data: savedText,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
// ----------------- GET ALL SAVED TEXTS -----------------
router.get("/save", async (req, res) => {
  try {
    const texts = await VoiceText.find().sort({ createdAt: -1 }); // latest first
    res.json({
      success: true,
      data: texts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ----------------- DELETE SAVED TEXT -----------------
router.delete("/save/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await VoiceText.findByIdAndDelete(id);

    if (!deleted)
      return res.status(404).json({ success: false, message: "Text not found" });

    res.json({ success: true, message: "Text deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
// POST /api/voice/tts
router.post("/tts", async (req, res) => {
  const { text, lang } = req.body;
  if (!text || !lang)
    return res.status(400).json({ message: "Missing text or lang" });

  // Map frontend lang to Google TTS code
  const ttsLang = lang === "ur-PK" ? "ur" : "en";

  try {
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${ttsLang}&client=tw-ob&q=${encodeURIComponent(
      text
    )}`;

    const response = await fetch(ttsUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0", // required for Google TTS
      },
    });

    if (!response.ok) {
      return res.status(500).json({ message: "Failed to fetch TTS audio" });
    }

    const buffer = await response.arrayBuffer();
    res.setHeader("Content-Type", "audio/mpeg");
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error("TTS error:", err);
    res.status(500).json({ message: "TTS fetch failed" });
  }
});

router.post("/api/grammar-check", async (req, res) => {
  try {
    const { text } = req.body;

    const response = await fetch("https://api.languagetool.org/v2/check", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        text,
        language: "en-US",
      }),
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Grammar check failed" });
  }
});
module.exports = router;
