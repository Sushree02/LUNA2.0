import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useMusicStore } from "@/store/useMusicStore";

export function SmartSuggestionBar() {
  const navigate = useNavigate();
  const { weatherMood, weatherText, timeLabel, city } = useMusicStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/mood/${weatherMood}`)}
      className="
        mx-4 mb-6 cursor-pointer
        rounded-2xl
        bg-gradient-to-r from-blue-500/20 to-indigo-500/20
        backdrop-blur-xl
        border border-white/10
        px-4 py-3
        shadow-lg shadow-blue-500/10
      "
    >
      <motion.div
        className="flex items-center justify-between"
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* LEFT */}
        <div>
          <p className="text-sm text-white/70">
            {timeLabel} · {weatherText}
          </p>

          <p className="text-base font-medium text-white">
            {city
              ? `In ${city}, try`
              : "Perfect time for"}{" "}
            <span className="text-blue-300">
              {weatherMood.toUpperCase()}
            </span>{" "}
            music 🎧
          </p>

          <p className="text-xs text-white/50 mt-1">
            Let the weather set the vibe ✨
          </p>
        </div>

        {/* ICON */}
        <motion.div
          className="text-2xl"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          🌦️
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
