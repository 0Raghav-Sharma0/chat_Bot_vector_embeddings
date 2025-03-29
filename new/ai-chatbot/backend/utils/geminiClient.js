const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Ensure API key exists
if (!process.env.GEMINI_API_KEY) {
    throw new Error("❌ GEMINI_API_KEY is missing in environment variables");
}

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

module.exports = genAI;
