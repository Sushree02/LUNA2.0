import express from "express";
import { searchMusic, getMoodSongsController } from "../controllers/musicController.js";

const router = express.Router();
router.get("/search", searchMusic);
router.get("/mood/:mood", getMoodSongsController);

export default router;
