import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Google GenAI SDK initialization (API key environment variable se uthayega: GEMINI_API_KEY)
const ai = new GoogleGenAI();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;

  if (!messages || messages.length === 0) {
    return res.status(400).json({ error: "Messages required hain." });
  }

  try {
    // Recent messages format karna Gemini ke contents structure ke mutabiq
    const formattedMessages = messages.slice(-20).map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: String(msg.content || "").slice(0, 10000) }]
    }));

    const response = await ai.models.generateContent({
      model: process.env.MODEL || "gemini-2.5-flash",
      contents: formattedMessages,
      config: {
        systemInstruction: `Tu ek helpful AI assistant hai.
User se Hindi, Hinglish aur English mein naturally baat kare.
Agar user code maange toh clean, complete aur secure code do.
Agar answer nahi ho toh guess mat karo.
Short aur useful answer do, lekin jab user detail maange tab detail mein samjhao.`,
        maxOutputTokens: 1500,
      },
    });

    res.json({
      reply: response.text || "Maaf kijiye, response generate nahi hua.",
    });

  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({
      error: "Server ya AI API mein problem aayi hai.",
      details: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Chatbot running: http://localhost:${PORT}`);
});
