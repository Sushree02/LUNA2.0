import { searchTracks, getMoodSongs } from "../services/musicBrainzService.js";

export const searchMusic = async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);
  res.json(await searchTracks(q));
};

export const getMoodSongsController = async (req, res) => {
  const { mood } = req.params;
  if (!mood) return res.json([]);
  res.json(await getMoodSongs(mood));
};
