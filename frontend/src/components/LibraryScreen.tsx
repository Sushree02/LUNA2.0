import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, ListPlus, Plus, Trash2, Play, LogOut, Shuffle, Repeat, Repeat1 } from "lucide-react";
import { SongRow } from "./SongRow";
import { StarField } from "./StarField";
import { useMusicStore } from "@/store/useMusicStore";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { signOut, getSession } from "@/auth";
import { useState } from "react";

export function LibraryScreen() {
  const navigate = useNavigate();
  const { libraries, toggleLike, setCurrentSong, createPlaylist, deletePlaylist, shuffle, repeatMode, setShuffle, cycleRepeat } = useMusicStore();
  const [selectedId, setSelectedId] = useState("favorites");
  const [creating, setCreating] = useState(false);
  const [playlistName, setPlaylistName] = useState("");
  const selected = libraries.find((library) => library.id === selectedId) || libraries[0];
  const songs = selected?.songs || [];
  const user = getSession();

  const create = () => {
    if (!playlistName.trim()) return;
    createPlaylist(playlistName);
    const created = useMusicStore.getState().libraries.find((library) => library.id !== "favorites" && library.name.toLowerCase() === playlistName.trim().toLowerCase());
    if (created) setSelectedId(created.id);
    setPlaylistName("");
    setCreating(false);
  };

  const playPlaylist = () => {
    if (!songs.length) return;
    setCurrentSong(songs[0], songs, 0);
    navigate("/player");
  };

  const shufflePlaylist = () => {
    if (!songs.length) return;
    setShuffle(true);
    const randomIndex = songs.length > 1 ? Math.floor(Math.random() * songs.length) : 0;
    setCurrentSong(songs[randomIndex], songs, randomIndex);
    navigate("/player");
  };

  const logout = () => { signOut(); window.location.href = "/auth"; };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <StarField />
      <div className="relative z-10 max-w-md mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => navigate("/")} className="p-2 rounded-full glass-card"><ArrowLeft className="w-6 h-6 text-periwinkle" /></button>
          <div className="flex-1"><h1 className="heading-lg text-periwinkle">Your Library</h1><p className="text-xs text-lavender/60">{user?.name}</p></div>
          <button onClick={logout} title="Sign out" className="p-2 rounded-full glass-card text-lavender"><LogOut size={18} /></button>
        </div>

        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm uppercase tracking-wider text-lavender/70">Playlists</h2>
          <button onClick={() => setCreating((value) => !value)} className="flex items-center gap-1 text-sm text-periwinkle"><Plus size={17} /> Create</button>
        </div>
        {creating && <div className="glass-card p-3 rounded-2xl mb-4 flex gap-2"><input autoFocus value={playlistName} onChange={(e) => setPlaylistName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && create()} placeholder="Playlist name" className="flex-1 bg-transparent outline-none text-white" /><button onClick={create} className="px-3 py-1 rounded-xl bg-violet-twilight text-white text-sm">Save</button></div>}

        <div className="space-y-2 mb-5">
          {libraries.map((library) => (
            <button key={library.id} onClick={() => setSelectedId(library.id)} className={`w-full text-left glass-card rounded-2xl px-4 py-3 flex items-center gap-3 ${selectedId === library.id ? "border-periwinkle/40 bg-white/10" : ""}`}>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center"><ListPlus size={18} /></div>
              <div className="flex-1"><p className="text-sm text-white font-semibold">{library.name}</p><p className="text-xs text-lavender/60">{library.songs.length} songs</p></div>
              {library.id !== "favorites" && <span onClick={(e) => { e.stopPropagation(); if (confirm(`Delete ${library.name}?`)) { deletePlaylist(library.id); setSelectedId("favorites"); } }} className="p-2 text-lavender/60 hover:text-red-300"><Trash2 size={15} /></span>}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 mb-3">
          <h2 className="heading-lg text-periwinkle flex-1">{selected?.name || "Playlist"}</h2>
          {songs.length > 0 && <>
            <button onClick={playPlaylist} className="p-2.5 rounded-full bg-violet-twilight text-white" title="Play playlist"><Play size={17} fill="currentColor" /></button>
            <button onClick={shufflePlaylist} className={`p-2.5 rounded-full transition ${shuffle ? "bg-soft-pink/20 text-soft-pink" : "glass-card text-lavender"}`} title="Shuffle playlist"><Shuffle size={17} /></button>
            <button onClick={cycleRepeat} className={`p-2.5 rounded-full transition ${repeatMode !== "off" ? "bg-soft-pink/20 text-soft-pink" : "glass-card text-lavender"}`} title={`Repeat: ${repeatMode}`}>
              {repeatMode === "one" ? <Repeat1 size={17} /> : <Repeat size={17} />}
            </button>
          </>}
        </div>
        {songs.length > 0 && <p className="text-[11px] text-lavender/50 mb-3">{shuffle ? "Shuffle on" : "Shuffle off"} · Repeat {repeatMode}</p>}
        <ScrollArea className="h-[calc(100vh-430px)] min-h-[260px]">
          <div className="space-y-3 pr-4">
            {songs.length > 0 ? songs.map((song, index) => <motion.div key={song.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.03 }}><SongRow song={song} onSelect={() => { setCurrentSong(song, songs, index); navigate("/player"); }} onLikeToggle={() => toggleLike(song)} /></motion.div>) : <div className="text-center py-16"><p className="body-lg text-lavender">{selected?.id === "favorites" ? "No liked songs yet 💔" : "This playlist is empty"}</p><p className="body-sm text-lavender/60 mt-2">Use the list button beside a song to add it here.</p></div>}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
