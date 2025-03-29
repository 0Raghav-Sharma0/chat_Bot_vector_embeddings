require('dotenv').config({ path: './backend/.env' });
console.log('PINECONE_API_KEY:', process.env.PINECONE_API_KEY); // Debugging
const express = require("express");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const chatRoutes = require("./routes/chatRoutes");
require("dns").setDefaultResultOrder("ipv4first");

// Connect to MongoDB
connectDB();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Serve frontend files
app.use(express.static(path.join(__dirname, "../frontend")));

// API Routes
app.use("/api", chatRoutes);

// Serve index.html when visiting the root URL
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// Handle unknown routes
app.use((req, res) => {
    res.status(404).send("❌ 404 - Page Not Found");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
