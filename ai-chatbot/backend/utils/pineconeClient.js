const { Pinecone } = require("@pinecone-database/pinecone");
require("dotenv").config();

const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY
});

const getIndex = async () => {
    const indexName = process.env.PINECONE_INDEX_NAME; // ✅ Ensure this is set in .env
    if (!indexName) {
        throw new Error("PINECONE_INDEX_NAME is not defined in environment variables");
    }
    return pinecone.index(indexName);
};

module.exports = getIndex;