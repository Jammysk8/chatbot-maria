// A simple Express server to proxy calls to Google Gemini API
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '../web/.env' }); // Re-use the existing .env if possible

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || '');

const SYSTEM_PROMPT = `
You are "Aurums AI", a helpful and knowledgeable trading assistant built into the Aurums dashboard.

Your expertise is in:
- XAUUSD (Gold) trading: market structure, session times, key levels, and price action
- Trading math: lot size calculations, pip value, risk-reward ratios, margin requirements
- MT5 basics: order types, spread, slippage, and EA usage
- General forex/CFD concepts

Rules:
- Be concise and direct. Use short paragraphs and bullet points where helpful.
- Use relevant emojis sparingly (📊 💰 📈).
- When doing calculations, show the working step by step.
- You must NOT give specific financial advice, trade recommendations, or predict price direction.
- If asked about trades to take, politely decline and explain you can help with analysis tools and calculations instead.
- If asked about Aurums features or bugs, direct users to the Support page.
- Keep responses under 200 words unless the user asks for detailed calculations.
`;

app.post('/api/chat', async (req, res) => {
    try {
        const { messages, context } = req.body;

        if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
            return res.status(500).json({ error: 'API Key not configured' });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const history = messages.slice(0, -1).map((msg) => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }],
        }));

        const lastMessage = messages[messages.length - 1];
        let userPrompt = lastMessage?.content || '';

        // Inject context if available
        if (context) {
            const contextString = `
Current User Stats: ${JSON.stringify(context.stats)}
Recent Trading History: ${JSON.stringify(context.trades)}
`;
            userPrompt = `User Context: ${contextString}\n\nUser Question: ${userPrompt}`;
        }

        const chat = model.startChat({
            history: [
                { role: 'user', parts: [{ text: 'You are Aurums AI. Follow this system instruction: ' + SYSTEM_PROMPT }] },
                { role: 'model', parts: [{ text: 'I understand! I am Aurums AI, your friendly trading assistant. How can I help you today? 📈' }] },
                ...history,
            ],
        });

        const result = await chat.sendMessage(userPrompt);
        const response = result.response;
        const text = response.text();

        res.json({
            role: 'assistant',
            content: text
        });
    } catch (error) {
        console.error('Gemini API Error:', error);
        res.status(500).json({ error: error.message || 'Failed to generate response' });
    }
});

app.listen(port, () => {
    console.log(`Aurums AI Vanilla Server running at http://localhost:${port}`);
    console.log(`Make sure GOOGLE_GENERATIVE_AI_API_KEY is in your ../web/.env file`);
});
