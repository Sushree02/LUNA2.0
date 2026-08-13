import { useEffect } from "react";
import { motion } from "framer-motion";
import { StarField } from "./StarField";

interface LoadingScreenProps {
  onLoadComplete: () => void;
}

export function LoadingScreen({ onLoadComplete }: LoadingScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onLoadComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onLoadComplete]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-deep-night via-twilight-indigo to-indigo-velvet">
      <StarField />

      <motion.div
        className="relative z-10 flex flex-col items-center text-center"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Welcome Text (NO BOX, ONLY TEXT GLOW) */}
        <motion.h1
          className="mb-1 text-2xl sm:text-3xl italic font-medium text-periwinkle"
          style={{
            textShadow:
              "0 0 12px rgba(167, 180, 255, 0.8), 0 0 24px rgba(120, 140, 255, 0.5)",
          }}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Welcome to Luna
        </motion.h1>

        {/* Tagline (lighter, less glow) */}
        <motion.p
          className="mb-6 text-sm sm:text-base italic text-periwinkle/70"
          style={{
            textShadow: "0 0 6px rgba(120, 140, 255, 0.3)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          – Let live life in sync
        </motion.p>

        {/* Glowing Moon */}
        <motion.div
          className="text-7xl mb-6 select-none"
          style={{
            textShadow:
              "0 0 20px rgba(255, 255, 255, 0.6), 0 0 40px rgba(180, 200, 255, 0.4)",
          }}
          animate={{ y: [0, -10, 0] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          🌙
        </motion.div>

        {/* Loading text */}
        <motion.p
          className="body-lg text-periwinkle/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Loading...
        </motion.p>
      </motion.div>
    </div>
  );
}