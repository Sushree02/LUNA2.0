import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

type Mood = "happy" | "sad" | "angry" | "calm" | "neutral";

type MoodConfig = {
  gradients: string;
  emoji: string;
  replies: string[];
  songSets: string[][];
};

const MOODS: Record<Mood, MoodConfig> = {
  happy: {
    gradients: "from-yellow-400 to-pink-500",
    emoji: "😄",
    replies: [
      "That’s amazing 💛 I’m really happy for you!",
      "Love that energy ✨ let’s keep it flowing",
      "Yay! That’s wonderful to hear 😄",
    ],
    songSets: [
      ["Ilahi", "Udd Gaye", "Happy"],
      ["Love You Zindagi", "Good Life", "On Top of the World"],
    ],
  },

  sad: {
    gradients: "from-blue-600 to-indigo-700",
    emoji: "🌧️",
    replies: [
      "I’m here with you 💙 take it one step at a time",
      "It’s okay to feel this way 🌙 music can help",
      "You don’t have to be strong all the time 🤍",
    ],
    songSets: [
      ["Khairiyat", "Agar Tum Saath Ho", "Fix You"],
      ["Let Her Go", "Someone Like You", "Channa Mereya"],
    ],
  },

  angry: {
    gradients: "from-red-500 to-orange-600",
    emoji: "😤",
    replies: [
      "Let it out 🔥 music can release that tension",
      "I feel that frustration — let’s channel it",
      "Take a breath, we’ll calm this storm together",
    ],
    songSets: [
      ["Believer", "Zinda", "Lose Yourself"],
      ["Thunder", "Apna Time Aayega", "Hallabol"],
    ],
  },

  calm: {
    gradients: "from-teal-400 to-blue-500",
    emoji: "🌿",
    replies: [
      "Peace suits you 🌙 stay here for a while",
      "That calm energy feels nice ✨",
      "Slow moments can be powerful too",
    ],
    songSets: [
      ["Kun Faya Kun", "Iktara", "River"],
      ["Weightless", "Cold Little Heart", "Ocean Eyes"],
    ],
  },

  neutral: {
    gradients: "from-purple-500 to-indigo-600",
    emoji: "✨",
    replies: [
      "Tell me a little more 🌸",
      "I’m listening 🎧",
      "What’s been on your mind lately?",
    ],
    songSets: [
      ["Night Changes", "Yellow", "Let Her Go"],
      ["Perfect", "Photograph", "Say You Won’t Let Go"],
    ],
  },
};

/* 🔍 Mood Detection */
function detectMood(text: string): Mood {
  const t = text.toLowerCase();

  if (["sad", "lonely", "cry", "tired", "broken"].some(w => t.includes(w)))
    return "sad";
  if (["happy", "good", "great", "excited", "love"].some(w => t.includes(w)))
    return "happy";
  if (["angry", "mad", "frustrated"].some(w => t.includes(w)))
    return "angry";
  if (["calm", "relaxed", "peace"].some(w => t.includes(w)))
    return "calm";

  return "neutral";
}

/* 🎲 Random helper */
const randomItem = <T,>(arr: T[]) =>
  arr[Math.floor(Math.random() * arr.length)];

export function AskLuna() {
  const [input, setInput] = useState("");
  const [mood, setMood] = useState<Mood>("neutral");
  const [reply, setReply] = useState<string>(
    randomItem(MOODS.neutral.replies)
  );
  const [songs, setSongs] = useState<string[]>(
    randomItem(MOODS.neutral.songSets)
  );

  const navigate = useNavigate();
  const config = MOODS[mood];

  const handleSend = () => {
    if (!input.trim()) return;

    const detectedMood = detectMood(input);
    const moodData = MOODS[detectedMood];

    setMood(detectedMood);
    setReply(randomItem(moodData.replies));
    setSongs(randomItem(moodData.songSets));
    setInput("");
  };

  return (
    <motion.div
      className={`min-h-screen px-4 pt-10 pb-28 bg-gradient-to-br ${config.gradients}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div className="text-center mb-6 text-white">
        <h1 className="text-xl font-semibold">
          Ask Luna {config.emoji}
        </h1>
        <p className="text-sm opacity-80">Tell me how you feel</p>
      </div>

      {/* Reply Bubble */}
      <motion.div
        className="bg-white/20 text-white rounded-xl px-4 py-3 mb-6 max-w-xs mx-auto text-sm"
        key={reply}
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        {reply}
      </motion.div>

      {/* Song Suggestions */}
      <div className="space-y-2 max-w-xs mx-auto">
        {songs.map(song => (
          <button
            key={song}
            onClick={() =>
              navigate(`/search?query=${encodeURIComponent(song)}`)
            }
            className="w-full bg-white/25 text-white py-2 rounded-lg text-sm backdrop-blur hover:bg-white/35 transition"
          >
            🎵 {song}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="fixed bottom-20 left-4 right-4 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type how you feel…"
          className="flex-1 rounded-full px-4 py-2 text-sm outline-none"
        />
        <button
          onClick={handleSend}
          className="bg-white text-black px-4 py-2 rounded-full text-sm font-medium"
        >
          Send
        </button>
      </div>
    </motion.div>
  );
}