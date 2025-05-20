const mongoose = require("mongoose");
require("dotenv").config();

const connectToDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL || "mongodb://127.0.0.1:27017/chatBot");
        console.log("✅ MongoDB Connected");
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error.message);
        process.exit(1);
    }
};

module.exports = connectToDb;