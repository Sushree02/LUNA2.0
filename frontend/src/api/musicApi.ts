import axios from "axios";

const API_BASE = `${import.meta.env.VITE_BACKEND_URL}/api/music`;

export async function searchMusic(query: string) {
  const res = await axios.get(`${API_BASE}/search`, { params: { q: query } });
  return res.data;
}

export async function getMoodSongs(mood: string) {
  const res = await axios.get(`${API_BASE}/mood/${encodeURIComponent(mood)}`);
  return res.data;
}
