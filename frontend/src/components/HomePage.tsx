import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Search,
  UserRound,
  LogOut,
  UserCircle,
  Camera,
  X,
  Check,
} from "lucide-react";
import { MoodBlock } from "./MoodBlock";
import { StarField } from "./StarField";
import { SmartSuggestionBar } from "./SmartSuggestionBar";
import { useMusicStore } from "@/store/useMusicStore";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  getSession,
  signOut,
  updateProfile,
  type LunaUser,
} from "@/auth";

/* =========================================================
   LUNA CAT
   Cute white sitting cat
   ========================================================= */

function SleepingCat() {
  return (
    <svg
      viewBox="0 0 220 220"
      className="w-28 h-28"
      aria-label="Cute white sitting cat"
      role="img"
    >
      {/* Tail */}
      <path
        d="M160 170
           C195 168 207 142 198 120
           C193 108 181 108 179 119
           C177 129 184 135 192 129"
        fill="none"
        stroke="#fffdf5"
        strokeWidth="15"
        strokeLinecap="round"
      />

      {/* Body */}
      <path
        d="M78 112
           C66 127 63 151 66 174
           C69 195 83 205 107 205
           H141
           C162 205 172 193 170 170
           C168 142 153 119 130 111
           C112 105 91 106 78 112Z"
        fill="#fffdf5"
      />

      {/* Head */}
      <path
        d="M55 82
           C55 48 79 25 111 25
           C143 25 168 49 168 82
           C168 115 145 134 111 134
           C77 134 55 115 55 82Z"
        fill="#fffdf5"
      />

      {/* Left ear */}
      <path
        d="M61 59 L66 17 L99 43 Z"
        fill="#fffdf5"
      />

      {/* Right ear */}
      <path
        d="M124 43 L157 17 L164 61 Z"
        fill="#fffdf5"
      />

      {/* Inner left ear */}
      <path
        d="M69 51 L71 30 L91 45 Z"
        fill="#f3cfc8"
      />

      {/* Inner right ear */}
      <path
        d="M133 45 L155 30 L158 53 Z"
        fill="#f3cfc8"
      />

      {/* Left eye */}
      <ellipse
        cx="83"
        cy="76"
        rx="9"
        ry="16"
        fill="#36323c"
        transform="rotate(18 83 76)"
      />

      {/* Right eye */}
      <ellipse
        cx="138"
        cy="76"
        rx="9"
        ry="16"
        fill="#36323c"
        transform="rotate(-18 138 76)"
      />

      {/* Nose */}
      <path
        d="M105 91
           Q111 86 117 91
           Q114 98 111 99
           Q108 98 105 91Z"
        fill="#e88978"
      />

      {/* Mouth */}
      <path
        d="M111 98
           C111 104 105 107 101 107
           M111 98
           C111 104 117 107 121 107"
        fill="none"
        stroke="#d8b7b1"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Left whiskers */}
      <path
        d="M76 96
           C61 94 48 91 37 86
           M76 102
           C59 102 47 104 36 108
           M77 107
           C62 111 52 116 43 122"
        fill="none"
        stroke="#77727c"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Right whiskers */}
      <path
        d="M146 96
           C161 94 174 91 185 86
           M146 102
           C163 102 175 104 186 108
           M145 107
           C160 111 170 116 179 122"
        fill="none"
        stroke="#77727c"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Left front leg */}
      <path
        d="M81 140
           C76 158 75 184 79 198
           C82 207 92 208 98 202
           C102 196 99 180 99 166
           L99 143Z"
        fill="#fffdf5"
      />

      {/* Right front leg */}
      <path
        d="M113 143
           C110 161 110 187 114 200
           C118 208 130 208 136 201
           C140 194 136 176 136 158
           L134 140Z"
        fill="#fffdf5"
      />

      {/* Paw details */}
      <path
        d="M84 195 V202
           M91 195 V202
           M120 195 V202
           M127 195 V202"
        fill="none"
        stroke="#ded9d0"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Chest highlight */}
      <path
        d="M103 127
           C98 138 97 151 100 162"
        fill="none"
        stroke="#f0ede4"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* =========================================================
   HOME PAGE
   ========================================================= */

export function HomePage() {
  const [searchValue, setSearchValue] = useState("");

  const [user, setUser] = useState<LunaUser | null>(() =>
    getSession()
  );

  const [profileOpen, setProfileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [profileName, setProfileName] = useState(
    user?.name || ""
  );

  const [profileError, setProfileError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    moodBlocks,
    setSearchQuery,
  } = useMusicStore();

  const navigate = useNavigate();

  /* =========================================================
     SEARCH
     ========================================================= */

  const handleSearch = (value: string) => {
    setSearchValue(value);
    setSearchQuery(value);

    if (value.trim()) {
      navigate("/search");
    }
  };

  /* =========================================================
     PROFILE PHOTO
     ========================================================= */

  const handlePhoto = (file?: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setProfileError("Please choose an image file.");
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setProfileError(
        "Please choose an image smaller than 3 MB."
      );
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const updated = updateProfile({
          avatar: String(reader.result),
        });

        setUser(updated);
        setProfileError("");
      } catch (error) {
        setProfileError(
          error instanceof Error
            ? error.message
            : "Could not save the photo."
        );
      }
    };

    reader.readAsDataURL(file);
  };

  /* =========================================================
     SAVE PROFILE NAME
     ========================================================= */

  const saveName = () => {
    if (profileName.trim().length < 2) {
      setProfileError(
        "Name must contain at least 2 characters."
      );
      return;
    }

    try {
      const updated = updateProfile({
        name: profileName,
      });

      setUser(updated);
      setProfileError("");
      setProfileOpen(false);
    } catch (error) {
      setProfileError(
        error instanceof Error
          ? error.message
          : "Could not update your profile."
      );
    }
  };

  /* =========================================================
     LOGOUT
     ========================================================= */

  const logout = () => {
    signOut();
    window.location.href = "/auth";
  };

  /* =========================================================
     UI
     ========================================================= */

  return (
    <div className="min-h-screen relative overflow-hidden">

      {/* Background stars */}
      <StarField />

      <div className="relative z-10 max-w-md mx-auto px-6 py-8">

        {/* =================================================
            HEADER
            ================================================= */}

        <motion.div
          className="relative flex items-center justify-center mb-8"
          initial={{
            opacity: 0,
            y: -20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
        >

          <h1 className="heading-xl text-periwinkle glow-soft">
            Luna
          </h1>

          {/* PROFILE BUTTON */}

          <div className="absolute right-0">

            <button
              onClick={() =>
                setMenuOpen((value) => !value)
              }
              className="w-10 h-10 rounded-full glass-card overflow-hidden flex items-center justify-center text-lavender hover:text-white transition"
              aria-label="Profile"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserRound size={19} />
              )}
            </button>

            {/* PROFILE MENU */}

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: -6,
                    scale: 0.96,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    y: -6,
                    scale: 0.96,
                  }}
                  className="absolute right-0 mt-2 w-44 glass-card rounded-2xl p-2 shadow-2xl z-50"
                >

                  {/* Profile */}

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setProfileName(
                        user?.name || ""
                      );
                      setProfileError("");
                      setProfileOpen(true);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white hover:bg-white/10"
                  >
                    <UserCircle size={17} />
                    Profile
                  </button>

                  {/* Logout */}

                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-soft-pink hover:bg-white/10"
                  >
                    <LogOut size={17} />
                    Logout
                  </button>

                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </motion.div>

        {/* =================================================
            SEARCH
            ================================================= */}

        <motion.div
          className="relative mb-12"
          initial={{
            opacity: 0,
            scale: 0.9,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
        >

          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-lavender w-5 h-5"
          />

          <Input
            type="text"
            placeholder="Search a song or artist…"
            value={searchValue}
            onChange={(e) =>
              handleSearch(e.target.value)
            }
            className="glass-card pl-12 pr-4 py-6 rounded-2xl"
          />

        </motion.div>

        {/* =================================================
            CAT
            ================================================= */}

        <motion.div
          className="flex flex-col items-center mb-10"
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
        >

          <div
            className="
              w-32 h-32
              rounded-full
              bg-gradient-to-br
              from-indigo-velvet/40
              to-violet-twilight/40
              flex
              items-center
              justify-center
              glow-soft
              mb-4
            "
          >
            <SleepingCat />
          </div>

          <p className="body-md text-lavender text-center">
            where thoughts melts & melodies blooms
          </p>

        </motion.div>

        {/* =================================================
            SMART SUGGESTION
            ================================================= */}

        <SmartSuggestionBar />

        {/* =================================================
            MOODS
            ================================================= */}

        <motion.div>

          <h2 className="heading-lg text-periwinkle mb-4">
            Moods
          </h2>

          <div className="grid grid-cols-2 gap-4">

            {moodBlocks.map(
              (block, index) => (
                <motion.div
                  key={block.mood}
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: index * 0.1,
                  }}
                >

                  <MoodBlock
                    moodBlock={block}
                    onSelect={() => {
                      setSearchQuery("");
                      navigate(
                        `/mood/${block.mood}`
                      );
                    }}
                  />

                </motion.div>
              )
            )}

          </div>

        </motion.div>

      </div>

      {/* =====================================================
          PROFILE MODAL
          ===================================================== */}

      <AnimatePresence>

        {profileOpen && (

          <motion.div
            className="
              fixed
              inset-0
              z-[80]
              flex
              items-center
              justify-center
              px-6
              bg-black/45
              backdrop-blur-sm
            "
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            onClick={() =>
              setProfileOpen(false)
            }
          >

            <motion.div
              className="
                w-full
                max-w-sm
                glass-card
                rounded-3xl
                p-6
              "
              initial={{
                opacity: 0,
                y: 20,
                scale: 0.96,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 20,
                scale: 0.96,
              }}
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              {/* Modal header */}

              <div className="flex items-center justify-between mb-5">

                <h2 className="heading-lg text-periwinkle">
                  Your Profile
                </h2>

                <button
                  onClick={() =>
                    setProfileOpen(false)
                  }
                  className="text-lavender"
                >
                  <X size={20} />
                </button>

              </div>

              {/* =================================================
                  PROFILE PHOTO
                  ================================================= */}

              <div className="flex flex-col items-center mb-5">

                <div className="relative">

                  <div
                    className="
                      w-24
                      h-24
                      rounded-full
                      overflow-hidden
                      bg-indigo-500/20
                      border
                      border-white/10
                      flex
                      items-center
                      justify-center
                    "
                  >

                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserRound
                        size={34}
                        className="text-lavender"
                      />
                    )}

                  </div>

                  {/* Camera button */}

                  <button
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    className="
                      absolute
                      -right-1
                      -bottom-1
                      w-9
                      h-9
                      rounded-full
                      bg-violet-twilight
                      text-white
                      flex
                      items-center
                      justify-center
                      shadow-lg
                    "
                    aria-label="Add profile photo"
                  >
                    <Camera size={16} />
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handlePhoto(
                        e.target.files?.[0]
                      )
                    }
                  />

                </div>

                <p className="text-xs text-lavender/60 mt-2">
                  Add a profile photo
                </p>

              </div>

              {/* =================================================
                  NAME
                  ================================================= */}

              <label className="text-xs text-lavender/70">
                Name
              </label>

              <input
                value={profileName}
                onChange={(e) =>
                  setProfileName(e.target.value)
                }
                className="
                  w-full
                  mt-1
                  mb-3
                  rounded-2xl
                  bg-white/5
                  border
                  border-white/10
                  px-4
                  py-3
                  text-white
                  outline-none
                "
              />

              {/* =================================================
                  EMAIL
                  ================================================= */}

              <label className="text-xs text-lavender/70">
                Email
              </label>

              <div
                className="
                  w-full
                  mt-1
                  rounded-2xl
                  bg-white/5
                  border
                  border-white/10
                  px-4
                  py-3
                  text-lavender/70
                  text-sm
                "
              >
                {user?.email}
              </div>

              {/* =================================================
                  ERROR
                  ================================================= */}

              {profileError && (
                <p className="text-sm text-soft-pink mt-3">
                  {profileError}
                </p>
              )}

              {/* =================================================
                  SAVE
                  ================================================= */}

              <button
                onClick={saveName}
                className="
                  w-full
                  mt-5
                  py-3
                  rounded-2xl
                  bg-violet-twilight
                  text-white
                  font-semibold
                  flex
                  items-center
                  justify-center
                  gap-2
                "
              >
                <Check size={17} />
                Save Profile
              </button>

            </motion.div>

          </motion.div>

        )}

      </AnimatePresence>

    </div>
  );
}