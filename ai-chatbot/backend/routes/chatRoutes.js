const express = require("express");
const axios = require("axios");
const getIndex = require("../utils/pineconeClient");
const Message = require("../models/Message");
const router = express.Router();

const conversationHistory = {}; // Store chat history per user

// Function to summarize previous conversation
async function summarizeConversation(history) {
    if (history.length <= 2) return ""; // Skip short history

    const summaryPrompt = {
        contents: [{ role: "user", parts: [{ text: `Summarize this conversation: ${JSON.stringify(history)}` }] }],
    };

    try {
        const GEMINI_CHAT_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
        const summaryRes = await axios.post(GEMINI_CHAT_URL, summaryPrompt);
        return summaryRes?.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } catch (error) {
        console.error("❌ Summarization Error:", error);
        return "";
    }
}

router.post("/chat", async (req, res) => {
    const { text, userId } = req.body;

    if (!userId) return res.status(400).json({ error: "userId is required" });

    if (!conversationHistory[userId]) conversationHistory[userId] = [];

    try {
        const GEMINI_EMBEDDING_URL = `https://generativelanguage.googleapis.com/v1/models/embedding-001:embedContent?key=${process.env.GEMINI_API_KEY}`;
        const GEMINI_CHAT_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

        // ✅ Step 1: Get embedding from Gemini
        const embeddingRes = await axios.post(GEMINI_EMBEDDING_URL, {
            model: "models/embedding-001", // ✅ Required
            content: { parts: [{ text }] }, // ✅ Correct format
        });
        
        const vector = embeddingRes.data?.embedding?.values;
        if (!vector) return res.status(500).json({ error: "Failed to generate embedding" });

        // ✅ Step 2: Retrieve similar messages from Pinecone
        const index = await getIndex();
        const pineconeRes = await index.query({
            vector,
            topK: 10, // Get top 10 relevant messages
            includeMetadata: true,
        });

        const similarMessages = pineconeRes.matches.map((m) => m.metadata.text) || [];

        // ✅ Step 3: Build Chat History
        let chatHistory = [...conversationHistory[userId]]; // Include previous messages
        const summary = await summarizeConversation(conversationHistory[userId]);
        if (summary) chatHistory.push({ role: "user", parts: [{ text: `Summary: ${summary}` }] });

        // Add relevant Pinecone messages
        similarMessages.forEach((msg) => {
            chatHistory.push({ role: "user", parts: [{ text: msg }] });
        });

        // Add latest user message
        chatHistory.push({ role: "user", parts: [{ text }] });

        // ✅ Step 4: Get AI Response from Gemini
        const geminiRes = await axios.post(GEMINI_CHAT_URL, {
            contents: chatHistory,
            generationConfig: { temperature: 0.7, maxOutputTokens: 200 },
        });

        let reply = geminiRes?.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No AI response";

        // ✅ Step 5: Store Message in Pinecone
        const messageId = `msg-${Date.now()}`;
        await index.upsert([{ id: messageId, values: vector, metadata: { text } }]);

        // ✅ Step 6: Save to MongoDB
        await Message.create({ text, response: reply });

        // ✅ Step 7: Update Conversation History
        conversationHistory[userId].push({ role: "user", parts: [{ text }] });
        conversationHistory[userId].push({ role: "assistant", parts: [{ text: reply }] });

        res.json({ reply, similarMessages });
    } catch (error) {
        console.error("❌ Chat Route Error:", error.response?.data || error.message);
        res.status(500).json({ error: "Error processing chat" });
    }
});

module.exports = router;
