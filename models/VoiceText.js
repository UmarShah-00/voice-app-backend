const mongoose = require("mongoose");

const voiceTextSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    language: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("VoiceText", voiceTextSchema);
