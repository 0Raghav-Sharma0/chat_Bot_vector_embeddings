const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    text: String,
    response: String,
}, { timestamps: true });

messageSchema.index({ createdAt: 1 }); // ⚡ Add Index to Speed Up Sorting

const Message = mongoose.model("Message", messageSchema); // ✅ Define Model

module.exports = Message; // ✅ Export Model