import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import musicRoutes from "./routes/musicRoutes.js";
import youtubeRoutes from "./routes/youtube.js";
import aiRoutes from "./routes/aiRoutes.js";

dotenv.config();

const app = express();

app.use(cors({ origin: "*", methods: ["GET", "POST"] }));
app.use(express.json());

console.log("YOUTUBE KEY:", !!process.env.YOUTUBE_API_KEY);
console.log("GEMINI KEY:", !!process.env.GEMINI_API_KEY);

app.get("/", (_req, res) => {
  res.send("LUNA backend is working 🌙");
});

app.use("/api/music", musicRoutes);
app.use("/api/youtube", youtubeRoutes);
app.use("/api/ai", aiRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
