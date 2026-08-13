import { create } from "zustand";
import type { Song, MoodBlock, Library } from "@/types";
import { searchMusic, getMoodSongs } from "@/api/musicApi";
import { getSession } from "@/auth";

const userId = getSession()?.id || "guest";
const key = (base: string) => `luna_${base}_${userId}`;

const FAVORITES_KEY = key("favorites");
const PLAYLISTS_KEY = key("playlists");
const LAST_PLAYED_KEY = key("last_played");
const VIDEO_IDS_KEY = key("song_video_ids");
let latestSearchRequest = 0;
export const PLAYBACK_POSITION_KEY = key("playback_seconds");

const loadJSON = <T,>(storageKey: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const saveJSON = (storageKey: string, value: unknown) => localStorage.setItem(storageKey, JSON.stringify(value));

export type WeatherMood = "energetic" | "happy" | "relax" | "chill" | "dark";
export type RepeatMode = "off" | "all" | "one";

interface MusicStore {
  currentSong: Song | null;
  isPlaying: boolean;
  progress: number;
  queue: Song[];
  currentIndex: number;
  songVideoIds: Record<string, string>;
  shuffle: boolean;
  repeatMode: RepeatMode;
  libraries: Library[];
  currentLibrary: Library | null;
  searchQuery: string;
  searchResults: Song[];
  moodBlocks: MoodBlock[];
  isLoading: boolean;
  weatherMood: WeatherMood;
  weatherText: string;
  timeLabel: string;
  city: string;
  setWeather: (mood: WeatherMood, weatherText: string, timeLabel: string, city: string) => void;
  setCurrentSong: (song: Song, queue?: Song[], index?: number) => void;
  playNext: () => void;
  playPrevious: () => void;
  togglePlayPause: () => void;
  setIsPlaying: (value: boolean) => void;
  setProgress: (seconds: number) => void;
  toggleLike: (song: Song) => void;
  createPlaylist: (name: string) => void;
  deletePlaylist: (playlistId: string) => void;
  addSongToPlaylist: (playlistId: string, song: Song) => void;
  removeSongFromPlaylist: (playlistId: string, songId: string) => void;
  setCurrentLibrary: (library: Library | null) => void;
  toggleShuffle: () => void;
  setShuffle: (value: boolean) => void;
  cycleRepeat: () => void;
  setRepeatMode: (value: RepeatMode) => void;
  setSearchQuery: (query: string) => void;
  performSearch: () => Promise<void>;
  loadMoodBlocks: () => Promise<void>;
  setSongVideoId: (songId: string, videoId: string) => void;
}

const normalizeSong = (song: Song, liked = false): Song => ({
  ...song,
  id: song.id || crypto.randomUUID(),
  title: song.title || song.name || "Unknown title",
  artist: typeof song.artist === "string" ? song.artist : song.artists?.map((a) => a.name).join(", ") || "Unknown artist",
  cover: song.cover || song.albumData?.images?.[0]?.url || "",
  duration: song.duration || 0,
  isLiked: liked,
});

const initialFavorites = loadJSON<Song[]>(FAVORITES_KEY, []);
const initialPlaylists = loadJSON<Library[]>(PLAYLISTS_KEY, []).map((library) => ({
  ...library,
  createdAt: new Date(library.createdAt),
}));
const favoritesLibrary: Library = {
  id: "favorites",
  name: "Liked Songs",
  songs: initialFavorites,
  createdAt: new Date(),
};
const initialLastPlayed = loadJSON<Song | null>(LAST_PLAYED_KEY, null);
const initialSeconds = loadJSON<number>(PLAYBACK_POSITION_KEY, 0);
const initialVideoIds = loadJSON<Record<string, string>>(VIDEO_IDS_KEY, {});

export const useMusicStore = create<MusicStore>((set, get) => ({
  currentSong: initialLastPlayed,
  isPlaying: false,
  progress: initialSeconds,
  queue: initialLastPlayed ? [initialLastPlayed] : [],
  currentIndex: 0,
  songVideoIds: initialVideoIds,
  shuffle: loadJSON<boolean>(key("shuffle"), false),
  repeatMode: loadJSON<RepeatMode>(key("repeat"), "off"),
  libraries: [favoritesLibrary, ...initialPlaylists],
  currentLibrary: favoritesLibrary,
  searchQuery: "",
  searchResults: [],
  moodBlocks: [],
  isLoading: false,
  weatherMood: "chill",
  weatherText: "",
  timeLabel: "",
  city: "",

  setWeather: (weatherMood, weatherText, timeLabel, city) => set({ weatherMood, weatherText, timeLabel, city }),

  setCurrentSong: (song, queue, index) => {
    const normalized = normalizeSong(song, get().libraries[0]?.songs.some((item) => item.id === song.id));
    saveJSON(LAST_PLAYED_KEY, normalized);
    saveJSON(PLAYBACK_POSITION_KEY, 0);
    set({ currentSong: normalized, queue: (queue || [normalized]).map((item) => normalizeSong(item, get().libraries[0]?.songs.some((liked) => liked.id === item.id))), currentIndex: index || 0, progress: 0, isPlaying: true });
  },

  playNext: () => set((state) => {
    if (!state.queue.length) return state;
    if (state.repeatMode === "one") return { ...state, progress: 0, isPlaying: true };

    let nextIndex: number;
    if (state.shuffle && state.queue.length > 1) {
      const choices = state.queue.map((_, i) => i).filter((i) => i !== state.currentIndex);
      nextIndex = choices[Math.floor(Math.random() * choices.length)];
    } else if (state.currentIndex + 1 < state.queue.length) {
      nextIndex = state.currentIndex + 1;
    } else if (state.repeatMode === "all") {
      nextIndex = 0;
    } else {
      return { ...state, isPlaying: false };
    }

    const nextSong = state.queue[nextIndex];
    saveJSON(LAST_PLAYED_KEY, nextSong);
    saveJSON(PLAYBACK_POSITION_KEY, 0);
    return { ...state, currentIndex: nextIndex, currentSong: nextSong, progress: 0, isPlaying: true };
  }),

  playPrevious: () => set((state) => {
    if (!state.queue.length) return state;
    const prevIndex = state.currentIndex > 0 ? state.currentIndex - 1 : state.repeatMode === "all" ? state.queue.length - 1 : 0;
    const previousSong = state.queue[prevIndex];
    saveJSON(LAST_PLAYED_KEY, previousSong);
    saveJSON(PLAYBACK_POSITION_KEY, 0);
    return { ...state, currentIndex: prevIndex, currentSong: previousSong, progress: 0, isPlaying: true };
  }),

  togglePlayPause: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setIsPlaying: (value) => set({ isPlaying: value }),
  setProgress: (seconds) => { saveJSON(PLAYBACK_POSITION_KEY, seconds); set({ progress: seconds }); },

  setSongVideoId: (songId, videoId) => set((state) => {
    const updated = { ...state.songVideoIds, [songId]: videoId };
    saveJSON(VIDEO_IDS_KEY, updated);
    return { songVideoIds: updated };
  }),

  toggleLike: (song) => set((state) => {
    const favorites = state.libraries.find((library) => library.id === "favorites") || favoritesLibrary;
    const liked = favorites.songs.some((item) => item.id === song.id);
    const songs = liked ? favorites.songs.filter((item) => item.id !== song.id) : [...favorites.songs, normalizeSong(song, true)];
    const updatedLibraries = state.libraries.map((library) => library.id === "favorites" ? { ...library, songs } : library);
    saveJSON(FAVORITES_KEY, songs);
    return { libraries: updatedLibraries, currentSong: state.currentSong?.id === song.id ? { ...state.currentSong, isLiked: !liked } : state.currentSong };
  }),

  createPlaylist: (name) => set((state) => {
    const trimmed = name.trim();
    if (!trimmed || state.libraries.some((library) => library.name.toLowerCase() === trimmed.toLowerCase())) return state;
    const playlist: Library = { id: `playlist-${crypto.randomUUID()}`, name: trimmed, songs: [], createdAt: new Date() };
    const libraries = [...state.libraries, playlist];
    saveJSON(PLAYLISTS_KEY, libraries.filter((library) => library.id !== "favorites"));
    return { libraries };
  }),

  deletePlaylist: (playlistId) => set((state) => {
    if (playlistId === "favorites") return state;
    const libraries = state.libraries.filter((library) => library.id !== playlistId);
    saveJSON(PLAYLISTS_KEY, libraries.filter((library) => library.id !== "favorites"));
    return { libraries, currentLibrary: state.currentLibrary?.id === playlistId ? libraries[0] : state.currentLibrary };
  }),

  addSongToPlaylist: (playlistId, song) => set((state) => {
    const libraries = state.libraries.map((library) => {
      if (library.id !== playlistId || library.songs.some((item) => item.id === song.id)) return library;
      return { ...library, songs: [...library.songs, normalizeSong(song)] };
    });
    saveJSON(PLAYLISTS_KEY, libraries.filter((library) => library.id !== "favorites"));
    return { libraries };
  }),

  removeSongFromPlaylist: (playlistId, songId) => set((state) => {
    const libraries = state.libraries.map((library) => library.id === playlistId ? { ...library, songs: library.songs.filter((song) => song.id !== songId) } : library);
    saveJSON(PLAYLISTS_KEY, libraries.filter((library) => library.id !== "favorites"));
    return { libraries };
  }),

  setCurrentLibrary: (currentLibrary) => set({ currentLibrary }),
  toggleShuffle: () => set((state) => { const shuffle = !state.shuffle; saveJSON(key("shuffle"), shuffle); return { shuffle }; }),
  setShuffle: (shuffle) => set(() => { saveJSON(key("shuffle"), shuffle); return { shuffle }; }),
  cycleRepeat: () => set((state) => { const repeatMode = state.repeatMode === "off" ? "all" : state.repeatMode === "all" ? "one" : "off"; saveJSON(key("repeat"), repeatMode); return { repeatMode }; }),
  setRepeatMode: (repeatMode) => set(() => { saveJSON(key("repeat"), repeatMode); return { repeatMode }; }),

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  performSearch: async () => {
    const query = get().searchQuery.trim();
    const requestId = ++latestSearchRequest;

    if (!query) return set({ searchResults: [] });

    try {
      const songs = await searchMusic(query);

      // Do not let an older/slower API response replace the latest search.
      if (requestId === latestSearchRequest) {
        set({ searchResults: songs });
      }
    } catch {
      if (requestId === latestSearchRequest) {
        set({ searchResults: [] });
      }
    }
  },

  loadMoodBlocks: async () => {
    set({ isLoading: true });
    try {
      const moods = ["chill", "happy", "sad", "focus"];
      const moodBlocks = [];

      // MusicBrainz is intentionally queried one-at-a-time. The backend also
      // enforces the one-request-per-second rule.
      for (const mood of moods) {
        const songs = await getMoodSongs(mood);
        moodBlocks.push({ mood, title: mood.toUpperCase(), songs });
      }

      set({ moodBlocks, isLoading: false });
    } catch {
      set({ moodBlocks: [], isLoading: false });
    }
  },
}));
