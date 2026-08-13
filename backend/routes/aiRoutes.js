import express from "express";
import fetch from "node-fetch";

const router = express.Router();

router.post("/chat", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  const msg = message.toLowerCase();

  // ✅ SIMPLE MOOD FALLBACK (ALWAYS WORKS)
  let mood = "calm";
  if (msg.includes("sad") || msg.includes("bad") || msg.includes("not good")) {
    mood = "sad";
  } else if (msg.includes("happy") || msg.includes("good") || msg.includes("great")) {
    mood = "happy";
  }

  const fallbackSongs = {
    sad: ["Khairiyat", "Agar Tum Saath Ho", "Phir Le Aaya Dil"],
    happy: ["Ilahi", "Zinda", "Safarnama"],
    calm: ["Kun Faya Kun", "Iktara", "Raabta"],
  };

  try {
    const GEMINI_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_KEY) throw new Error("GEMINI_API_KEY missing");

    const response = await fetch(
     `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `User feeling: "${message}". Respond kindly and suggest 3 songs.`,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      `I sense a ${mood} mood 🌙`;

    return res.json({
      text,
      songs: fallbackSongs[mood],
    });
  } catch (err) {
    console.error("Gemini failed, using fallback");

    return res.json({
      text: `I sense a ${mood} mood 🌙`,
      songs: fallbackSongs[mood],
    });
  }
});

export default router;