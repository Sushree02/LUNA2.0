import type { Song, MoodBlock, Library } from "@/types";

/* ================= MOCK SONGS ================= */

export const mockSongs: Song[] = [
  {
    id: "1",
    title: "Midnight Dreams",
    artist: "Luna Waves",
    duration: 234,
    cover: "https://picsum.photos/200/200?random=1",
    isLiked: true,
  },
  {
    id: "2",
    title: "Starlight Serenade",
    artist: "Cosmic Cafe",
    duration: 198,
    cover: "https://picsum.photos/200/200?random=2",
    isLiked: false,
  },
  {
    id: "3",
    title: "Peaceful Nights",
    artist: "Dreamy Echo",
    duration: 267,
    cover: "https://picsum.photos/200/200?random=3",
    isLiked: true,
  },
  {
    id: "4",
    title: "Soft Whispers",
    artist: "Silent Moon",
    duration: 189,
    cover: "https://picsum.photos/200/200?random=4",
    isLiked: false,
  },
  {
    id: "5",
    title: "Twilight Melody",
    artist: "Evening Breeze",
    duration: 245,
    cover: "https://picsum.photos/200/200?random=5",
    isLiked: true,
  },
  {
    id: "6",
    title: "Cozy Corner",
    artist: "Warm Vibes",
    duration: 212,
    cover: "https://picsum.photos/200/200?random=6",
    isLiked: false,
  },
];

/* ================= MOCK MOOD BLOCKS ================= */

export const mockMoodBlocks: MoodBlock[] = [
  {
    mood: "chill",
    title: "Chill Vibes",
    songs: [mockSongs[0], mockSongs[1], mockSongs[2]],
  },
  {
    mood: "focus",
    title: "Focus Mode",
    songs: [mockSongs[1], mockSongs[3], mockSongs[4]],
  },
  {
    mood: "late-night",
    title: "Late Night",
    songs: [mockSongs[0], mockSongs[2], mockSongs[5]],
  },
  {
    mood: "dreamy",
    title: "Dreamy",
    songs: [mockSongs[2], mockSongs[4], mockSongs[5]],
  },
  {
    mood: "peaceful",
    title: "Peaceful",
    songs: [mockSongs[0], mockSongs[3], mockSongs[5]],
  },
  {
    mood: "cozy",
    title: "Cozy Corner",
    songs: [mockSongs[1], mockSongs[2], mockSongs[5]],
  },
];

/* ================= MOCK LIBRARIES ================= */

export const mockLibraries: Library[] = [
  {
    id: "favorites",
    name: "My Favorites",
    songs: mockSongs.filter((song) => song.isLiked),
    createdAt: new Date("2024-01-01"),
  },
];
