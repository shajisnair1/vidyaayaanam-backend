// server.js - FINAL VERSION FOR VIDYAAYANAM (DECEMBER 2025)
require('dotenv').config();
const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai"); 
const cors = require('cors');

const app = express();

// --- 1. Middleware & Security ---
// This allows your Firebase site to talk to this Render server
app.use(cors({
    origin: 'https://vidyaayaanam.web.app',
    methods: ['POST', 'GET'],
    credentials: true
}));
app.use(express.json());

// --- 2. AI Configuration ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODEL_NAME = "gemini-3-flash"; // Highly stable for educational tools

// --- 3. The API Endpoint ---
app.post('/api/generate-resource', async (req, res) => {
    const { resourceType, medium, std, subject, chapter, extra, part } = req.body;

    if (!std || !subject || !chapter) {
        return res.status(400).json({ success: false, details: "Missing Class, Subject, or Topic." });
    }

    let partDetail = (part && part !== "Single Book") ? `(${part})` : "";
    
    // Custom Prompt for Kerala SCERT
    const prompt = `Act as an expert SCERT Kerala Teacher. Create a detailed ${resourceType} for a ${std} ${subject} class in ${medium}. 
    Topic: ${chapter}. Textbook: Kerala SCERT ${partDetail}. Extra instructions: ${extra || 'None'}.
    Structure it with: Activity Steps, Resources, Ideas/Values, Assessment, and Extended Activities. 
    Output language: ${medium}.`;

    try {
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        if (!text) throw new Error("AI returned an empty response.");
        res.json({ success: true, answer: text });

    } catch (error) {
        console.error("AI Error:", error.message);
        res.status(500).json({ success: false, details: "The AI is busy or the request failed. Please try again." });
    }
});

// --- 4. Health Check (To test Render first) ---
app.get('/', (req, res) => {
    res.send("🚀 Vidyaayaanam Backend is Live and Connected!");
});

// --- 5. Start Server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);

});
