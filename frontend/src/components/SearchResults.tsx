import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, ArrowLeft } from "lucide-react";
import { SongRow } from "./SongRow";
import { StarField } from "./StarField";
import { useMusicStore } from "@/store/useMusicStore";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import type { Song } from "@/types";
import { searchYouTubeVideo } from "@/api/youtubeSearch";

export function SearchResults() {
  const { mood } = useParams();
  const navigate = useNavigate();

  const {
    searchResults,
    moodBlocks,
    setSearchQuery,
    performSearch,
    setCurrentSong,
    toggleLike,
    setSongVideoId,
    songVideoIds,
  } = useMusicStore();

  const [localQuery, setLocalQuery] = useState("");
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const initial = useMusicStore.getState().searchQuery;
    setLocalQuery(initial);
    if (!mood && initial.trim()) performSearch();
  }, [mood, performSearch]);

  /* 🎵 Songs to display */
  const displaySongs: Song[] = mood
    ? moodBlocks.find((b) => b.mood === mood)?.songs || []
    : searchResults;

  const title = mood
    ? moodBlocks.find((b) => b.mood === mood)?.title || "Songs"
    : "Search Results";

  const handleSearch = (value: string) => {
    setLocalQuery(value);
    setSearchQuery(value);

    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    if (!value.trim()) return;

    // MusicBrainz is rate-limited, so do not send a request for every
    // character typed. Wait until the user pauses briefly.
    searchTimerRef.current = setTimeout(() => {
      performSearch();
    }, 450);
  };

  useEffect(() => {
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, []);

  /* 🔥 FIXED CLICK HANDLER */
  const handleSongClick = async (song: Song, index: number) => {
    // 1️⃣ Set queue + current song
    setCurrentSong(song, displaySongs, index);

    // 2️⃣ Build STRONG YouTube search query ✅
    const songTitle = song.title ?? song.name ?? "";
    const artist =
      typeof song.artist === "string"
        ? song.artist
        : song.artists?.map((a) => a.name).join(" ") ?? "";

    // 🔥 THIS IS THE IMPORTANT FIX
    const query = `${songTitle} ${artist} official audio`.trim();

    // 3️⃣ Resolve YouTube videoId (cache first)
    let resolvedVideoId =
      song.videoId ?? songVideoIds[song.id!];

    if (!resolvedVideoId) {
      const result = await searchYouTubeVideo(query);

      if (!result) {
        console.warn(
          "❌ No matching YouTube video found for:",
          query
        );
        return;
      }

      resolvedVideoId = result;
      setSongVideoId(song.id!, resolvedVideoId);
    }

    // 4️⃣ Navigate ONLY
    navigate("/player");
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <StarField />

      <div className="relative z-10 max-w-md mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-full glass-card"
          >
            <ArrowLeft className="w-6 h-6 text-periwinkle" />
          </button>
          <h1 className="heading-lg text-periwinkle">
            {title}
          </h1>
        </div>

        {/* Search */}
        {!mood && (
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-lavender" />
            <Input
              placeholder="Search a song or artist…"
              value={localQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-12 py-4 rounded-2xl glass-card"
            />
          </div>
        )}

        {/* Songs */}
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-3 pr-4">
            {displaySongs.length > 0 ? (
              displaySongs.map((song, index) => (
                <motion.div key={song.id}>
                  <SongRow
                    song={song}
                    onSelect={() =>
                      handleSongClick(song, index)
                    }
                    onLikeToggle={() => toggleLike(song)}
                  />
                </motion.div>
              ))
            ) : (
              <p className="text-center text-lavender">
                No results found
              </p>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
