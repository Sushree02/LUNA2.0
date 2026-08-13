import express from "express";
import { searchYouTube } from "../services/youtubeService.js";

const router = express.Router();

router.get("/search", async (req, res) => {
  const q = req.query.q;

  if (!q) {
    return res.json({ videoId: null });
  }

  const videoId = await searchYouTube(q);
  res.json({ videoId });
});

export default router;
