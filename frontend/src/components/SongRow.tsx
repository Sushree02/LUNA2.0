import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Heart, Music, ListPlus, Plus } from "lucide-react";
import type { Song } from "@/types";
import { motion, useMotionValue, useTransform } from "framer-motion";
import type { PanInfo } from "framer-motion";
import { useMusicStore } from "@/store/useMusicStore";
import { useState } from "react";

interface SongRowProps { song: Song; onSelect: (song: Song) => void; onLikeToggle: (song: Song) => void; }

export function SongRow({ song, onSelect, onLikeToggle }: SongRowProps) {
  const title = song.title ?? song.name ?? "Unknown title";
  const artist = song.artist ?? song.artists?.map((a) => a.name).join(", ") ?? "Unknown artist";
  const cover = song.cover ?? song.albumData?.images?.[0]?.url;
  const { currentSong, isPlaying, libraries, addSongToPlaylist, createPlaylist } = useMusicStore();
  const isLiked = libraries.find((library) => library.id === "favorites")?.songs.some((item) => item.id === song.id) || song.isLiked || false;
  const [showPlaylists, setShowPlaylists] = useState(false);
  const [creatingPlaylist, setCreatingPlaylist] = useState(false);
  const [playlistName, setPlaylistName] = useState("");
  const playlists = libraries.filter((library) => library.id !== "favorites");
  const isCurrentPlaying = isPlaying && currentSong?.id === song.id;
  const x = useMotionValue(0);
  const bgColor = useTransform(x, [-80, 0, 80], ["rgba(79,70,229,0.15)", "rgba(0,0,0,0)", "rgba(236,72,153,0.15)"]);

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > 70 || (info.offset.x < -70 && !isLiked)) onLikeToggle(song);
  };

  const addToNewPlaylist = () => {
    const trimmed = playlistName.trim();
    if (!trimmed) return;
    createPlaylist(trimmed);
    const newPlaylist = useMusicStore.getState().libraries.find((library) => library.name.toLowerCase() === trimmed.toLowerCase() && library.id !== "favorites");
    if (newPlaylist) addSongToPlaylist(newPlaylist.id, song);
    setPlaylistName("");
    setCreatingPlaylist(false);
    setShowPlaylists(false);
  };

  return (
    <motion.div drag="x" dragConstraints={{ left: -80, right: 80 }} dragElastic={0.2} style={{ x, backgroundColor: bgColor }} onDragEnd={handleDragEnd} whileTap={{ scale: 0.98 }} onClick={() => onSelect(song)} className={`group relative flex items-center gap-3 px-4 pr-3 py-2 w-full cursor-pointer border-b border-white/10 transition ${isCurrentPlaying ? "bg-white/5" : ""}`}>
      {isCurrentPlaying && <div className="absolute left-0 top-0 h-full w-[3px] bg-indigo-400 rounded-r-full" />}
      <Avatar className="w-10 h-10 rounded-md flex-shrink-0"><AvatarImage src={cover} alt={title} /><AvatarFallback className="bg-indigo-velvet rounded-md"><Music size={14} className="text-periwinkle" /></AvatarFallback></Avatar>
      <div className="flex-1 min-w-0"><p className={`text-sm truncate ${isCurrentPlaying ? "text-indigo-300 font-semibold" : "text-periwinkle"}`}>{title}</p><p className="text-lavender text-xs truncate">{artist}</p></div>
      <div className="flex items-center gap-1 flex-shrink-0 z-20">
        <div className="relative">
          <button onClick={(e) => { e.stopPropagation(); setShowPlaylists((value) => !value); }} className="p-1 rounded-full hover:bg-white/10 text-lavender" aria-label="Add to playlist"><ListPlus size={16} /></button>
          {showPlaylists && <div onClick={(e) => e.stopPropagation()} className="absolute right-0 bottom-8 w-56 rounded-2xl glass-card p-2 z-50 shadow-xl">
            <p className="text-xs text-lavender/60 px-2 py-1">Add to playlist</p>
            {playlists.map((playlist) => <button key={playlist.id} onClick={() => { addSongToPlaylist(playlist.id, song); setShowPlaylists(false); }} className="w-full text-left text-sm text-white px-2 py-2 rounded-xl hover:bg-white/10">{playlist.name}<span className="block text-[10px] text-lavender/50">{playlist.songs.length} songs</span></button>)}
            {!creatingPlaylist ? <button onClick={() => setCreatingPlaylist(true)} className="w-full flex items-center gap-2 text-left text-sm text-periwinkle px-2 py-2 rounded-xl hover:bg-white/10"><Plus size={15} /> New playlist</button> : <div className="mt-1 flex gap-1"><input autoFocus value={playlistName} onChange={(e) => setPlaylistName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addToNewPlaylist()} onClick={(e) => e.stopPropagation()} placeholder="Playlist name" className="min-w-0 flex-1 bg-white/5 border border-white/10 rounded-xl px-2 py-2 text-xs text-white outline-none" /><button onClick={addToNewPlaylist} className="px-2 rounded-xl bg-violet-twilight text-white text-xs">Add</button></div>}
          </div>}
        </div>
        <button onClick={(e) => { e.stopPropagation(); onLikeToggle(song); }} className="p-1 rounded-full hover:bg-white/10 transition"><Heart size={16} className={isLiked ? "text-soft-pink fill-soft-pink" : "text-lavender"} /></button>
      </div>
    </motion.div>
  );
}
