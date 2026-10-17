import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;

  if (!messages || messages.length === 0) {
    return res.status(400).json({ error: "Messages required hain." });
  }

  try {
    const recentMessages = messages.slice(-20).map((msg) => ({
      role: msg.role === "assistant" ? "assistant" : "user",
      content: String(msg.content || "").slice(0, 10000),
    }));

    const response = await openai.chat.completions.create({
      model: process.env.MODEL || "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: `Tum ek helpful AI assistant ho.
          User se Hindi, Hinglish aur English mein naturally baat karo.
          Agar user code maange to clean, complete aur secure code do.
          Agar answer nahi पता ho to guess mat karo.
          Short aur useful answer do, lekin jab user detail maange tab detail mein samjhao.`,
        },
        ...recentMessages,
      ],
      max_output_tokens: 1500,
    });

    res.json({
      reply:
        response.choices[0].message.content ||
        "Maaf kijiye, response generate nahi hua.",
    });
  } catch (error) {
    console.error("OpenAI Error:", error);
    res.status(500).json({
      error: "Server ya AI API mein problem aayi hai.",
      details: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Chatbot running: http://localhost:${PORT}`);
});
