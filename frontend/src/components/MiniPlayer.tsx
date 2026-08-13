import { Music, X, Play, Pause } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useMusicStore } from "@/store/useMusicStore";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { MouseEvent } from "react";

export function MiniPlayer() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentSong, setIsPlaying } = useMusicStore();
  const [hidden, setHidden] = useState(false);
  const [playing, setPlaying] = useState(false);
  useEffect(() => { setHidden(false); }, [currentSong?.id]);
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (window.player && window.playerReady && window.YT?.PlayerState) setPlaying(window.player.getPlayerState() === window.YT.PlayerState.PLAYING);
    }, 400);
    return () => clearInterval(timer);
  }, []);
  if (!currentSong || hidden || location.pathname === "/player") return null;
  const toggle = (event: MouseEvent) => {
    event.stopPropagation();
    if (!window.player || !window.playerReady) return;
    const isNowPlaying = window.player.getPlayerState() === window.YT.PlayerState.PLAYING;
    if (isNowPlaying) { window.player.pauseVideo(); setPlaying(false); setIsPlaying(false); }
    else { window.player.playVideo(); setPlaying(true); setIsPlaying(true); }
  };
  const bars = Array.from({ length: 28 });
  return (
    <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="fixed bottom-[72px] left-1/2 -translate-x-1/2 w-full max-w-sm z-40">
      <div onClick={() => navigate("/player")} className="relative mx-3 flex items-center gap-3 px-3 py-2 rounded-2xl bg-[#0f1f3d]/95 backdrop-blur-xl shadow-lg cursor-pointer">
        <button onClick={(e) => { e.stopPropagation(); setHidden(true); }} className="absolute right-2 top-2 text-indigo-200 hover:text-white"><X size={14} /></button>
        {currentSong.cover ? <img src={currentSong.cover} alt={currentSong.title} className="w-10 h-10 rounded-xl object-cover" /> : <div className="w-10 h-10 rounded-xl bg-indigo-500/30 flex items-center justify-center"><Music size={16} /></div>}
        <div className="flex-1 overflow-hidden pr-5"><p className="text-sm font-semibold text-white truncate leading-tight">{currentSong.title}</p><p className="text-xs text-indigo-200 truncate leading-tight">{currentSong.artist}</p><div className="mt-1 flex items-end gap-[2px] h-3">{bars.map((_, i) => <motion.span key={i} className="w-[2px] rounded-full bg-indigo-300" animate={{ height: playing ? [4, 10, 6, 12, 8] : 3 }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.04, ease: "easeInOut" }} />)}</div></div>
        <button onClick={toggle} className="w-9 h-9 rounded-full bg-indigo-500/30 flex items-center justify-center text-white" aria-label={playing ? "Pause" : "Play"}>{playing ? <Pause size={17} /> : <Play size={17} />}</button>
      </div>
    </motion.div>
  );
}
