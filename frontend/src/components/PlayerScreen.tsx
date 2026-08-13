import { useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  Heart,
  X,
  Music,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Timer,
} from "lucide-react";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import { StarField } from "./StarField";
import { useMusicStore } from "@/store/useMusicStore";
import { useNavigate } from "react-router-dom";
import { formatDuration } from "@/utils/formatters";
import { searchYouTubeVideo } from "@/api/youtubeSearch";

export function PlayerScreen() {
  const navigate = useNavigate();

  const {
    currentSong,
    toggleLike,
    playNext,
    playPrevious,
    setSongVideoId,
    libraries,
    setIsPlaying,
    shuffle,
    repeatMode,
    toggleShuffle,
    cycleRepeat,
    progress,
    setProgress,
  } = useMusicStore();

  const [ytState, setYtState] = useState<number>(-1);
  const [duration, setDuration] = useState(0);

  // Sleep timer
  const [timerOpen, setTimerOpen] = useState(false);
  const [sleepTimerEnd, setSleepTimerEnd] = useState<number | null>(
    null
  );
  const [remainingTimerSeconds, setRemainingTimerSeconds] =
    useState(0);

  const autoplayLock = useRef(false);

  useEffect(() => {
    if (!currentSong) {
      navigate("/");
    }
  }, [currentSong, navigate]);

  const favorites =
    libraries.find((lib) => lib.id === "favorites")?.songs || [];

  const isLiked = favorites.some(
    (song) => song.id === currentSong?.id
  );

  /* =========================================================
     LOAD CURRENT SONG
     ========================================================= */

  useEffect(() => {
    if (!currentSong || !window.player || !window.playerReady)
      return;

    let cancelled = false;

    const playSong = async () => {
      const query =
        `${currentSong.title ?? ""} ${
          currentSong.artist ?? ""
        } official audio`.trim();

      let videoId =
        useMusicStore.getState().songVideoIds[currentSong.id];

      if (!videoId) {
        videoId = (await searchYouTubeVideo(query)) || "";

        if (!videoId) return;

        setSongVideoId(currentSong.id, videoId);
      }

      if (cancelled) return;

      window.player.loadVideoById(videoId);

      const savedSeconds =
        useMusicStore.getState().progress || 0;

      window.setTimeout(() => {
        if (!window.player || cancelled) return;

        if (savedSeconds > 0) {
          window.player.seekTo(savedSeconds, true);
        }

        window.player.playVideo();
      }, 450);
    };

    playSong();

    return () => {
      cancelled = true;
    };
  }, [currentSong?.id, setSongVideoId]);

  /* =========================================================
     YOUTUBE PLAYER STATE
     ========================================================= */

  useEffect(() => {
    if (!window.player || !window.playerReady) return;

    const interval = window.setInterval(() => {
      const state = window.player.getPlayerState();

      setYtState(state);

      const current =
        window.player.getCurrentTime?.() || 0;

      const total =
        window.player.getDuration?.() || 0;

      if (total > 0) {
        setDuration(total);
        setProgress(current);
      }

      if (
        state === window.YT.PlayerState.PLAYING
      ) {
        setIsPlaying(true);
      }

      if (
        state === window.YT.PlayerState.PAUSED ||
        state === window.YT.PlayerState.CUED
      ) {
        setIsPlaying(false);
      }

      if (
        state === window.YT.PlayerState.ENDED &&
        !autoplayLock.current
      ) {
        autoplayLock.current = true;

        if (repeatMode === "one") {
          window.player.seekTo(0, true);
          window.player.playVideo();
        } else {
          playNext();
        }

        window.setTimeout(() => {
          autoplayLock.current = false;
        }, 800);
      }
    }, 400);

    return () => clearInterval(interval);
  }, [
    playNext,
    repeatMode,
    setIsPlaying,
    setProgress,
  ]);

  /* =========================================================
     SLEEP TIMER
     ========================================================= */

  const setSleepTimer = (minutes: number) => {
    const endTime =
      Date.now() + minutes * 60 * 1000;

    setSleepTimerEnd(endTime);
    setRemainingTimerSeconds(minutes * 60);
    setTimerOpen(false);
  };

  const cancelSleepTimer = () => {
    setSleepTimerEnd(null);
    setRemainingTimerSeconds(0);
    setTimerOpen(false);
  };

  useEffect(() => {
    if (!sleepTimerEnd) return;

    const timer = window.setInterval(() => {
      const remaining = Math.max(
        0,
        Math.ceil(
          (sleepTimerEnd - Date.now()) / 1000
        )
      );

      setRemainingTimerSeconds(remaining);

      if (remaining <= 0) {
        window.clearInterval(timer);

        if (
          window.player &&
          window.playerReady
        ) {
          window.player.pauseVideo();
        }

        setIsPlaying(false);
        setSleepTimerEnd(null);
        setTimerOpen(false);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [sleepTimerEnd, setIsPlaying]);

  const formatTimer = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor(
      (seconds % 3600) / 60
    );
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(
        2,
        "0"
      )}:${String(secs).padStart(2, "0")}`;
    }

    return `${minutes}:${String(secs).padStart(
      2,
      "0"
    )}`;
  };

  /* =========================================================
     PLAY / PAUSE
     ========================================================= */

  const handlePlayPause = () => {
    if (!window.player || !window.playerReady)
      return;

    const playing =
      window.player.getPlayerState() ===
      window.YT.PlayerState.PLAYING;

    if (playing) {
      window.player.pauseVideo();
      setIsPlaying(false);
    } else {
      window.player.playVideo();
      setIsPlaying(true);
    }
  };

  /* =========================================================
     SEEK
     ========================================================= */

  const handleSeek = (value: number) => {
    if (!window.player || !window.playerReady)
      return;

    window.player.seekTo(value, true);
    setProgress(value);
  };

  if (!currentSong) return null;

  const totalDuration =
    duration || currentSong.duration || 0;

  const isPlaying =
    ytState ===
    window.YT?.PlayerState?.PLAYING;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <StarField />

      <div className="max-w-md mx-auto px-6 py-8 flex flex-col h-screen">

        {/* Close */}

        <button
          onClick={() => navigate(-1)}
          className="self-end mb-4"
          aria-label="Close player"
        >
          <X />
        </button>

        {/* Cover */}

        <Avatar className="w-64 h-64 mx-auto my-6">
          <AvatarImage src={currentSong.cover} />
          <AvatarFallback>
            <Music />
          </AvatarFallback>
        </Avatar>

        <div className="glass-card p-6 rounded-3xl">

          {/* Song info */}

          <h2 className="text-center text-lg font-semibold">
            {currentSong.title}
          </h2>

          <p className="text-center text-sm opacity-70">
            {currentSong.artist}
          </p>

          {/* Progress */}

          <input
            type="range"
            min={0}
            max={Math.max(totalDuration, 1)}
            value={Math.min(
              progress,
              Math.max(totalDuration, 1)
            )}
            onChange={(e) =>
              handleSeek(Number(e.target.value))
            }
            className="w-full my-4 cursor-pointer accent-sky-400 h-2 rounded-full"
          />

          <div className="flex justify-between text-sm opacity-70">
            <span>
              {formatDuration(
                Math.floor(progress)
              )}
            </span>

            <span>
              {formatDuration(
                Math.floor(totalDuration)
              )}
            </span>
          </div>

          {/* Main controls */}

          <div className="flex justify-center items-center gap-5 mt-6">

            <button
              onClick={toggleShuffle}
              title="Shuffle"
              className={
                shuffle
                  ? "text-pink-300"
                  : "text-lavender"
              }
            >
              <Shuffle size={19} />
            </button>

            <button
              onClick={() =>
                toggleLike(currentSong)
              }
              aria-label="Like"
            >
              <Heart
                className={
                  isLiked
                    ? "fill-pink-500 text-pink-500"
                    : "text-white"
                }
              />
            </button>

            <button
              onClick={playPrevious}
              aria-label="Previous"
            >
              <SkipBack />
            </button>

            <button
              onClick={handlePlayPause}
              className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center"
              aria-label={
                isPlaying ? "Pause" : "Play"
              }
            >
              {isPlaying ? (
                <Pause />
              ) : (
                <Play />
              )}
            </button>

            <button
              onClick={playNext}
              aria-label="Next"
            >
              <SkipForward />
            </button>

            <button
              onClick={cycleRepeat}
              title={`Repeat: ${repeatMode}`}
              className={
                repeatMode !== "off"
                  ? "text-pink-300"
                  : "text-lavender"
              }
            >
              {repeatMode === "one" ? (
                <Repeat1 size={20} />
              ) : (
                <Repeat size={20} />
              )}
            </button>

          </div>

          {/* =================================================
              SLEEP TIMER
              ================================================= */}

          <div className="relative mt-6">

            <button
              onClick={() =>
                setTimerOpen(
                  (value) => !value
                )
              }
              className={`mx-auto flex items-center justify-center gap-2 px-4 py-2 rounded-full transition ${
                sleepTimerEnd
                  ? "text-pink-300 bg-pink-500/10"
                  : "text-lavender hover:text-white"
              }`}
            >
              <Timer size={17} />

              {sleepTimerEnd ? (
                <span>
                  Stops in{" "}
                  {formatTimer(
                    remainingTimerSeconds
                  )}
                </span>
              ) : (
                <span>Sleep Timer</span>
              )}
            </button>

            {timerOpen && (
              <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-52 glass-card rounded-2xl p-3 z-50 shadow-2xl">

                <p className="text-xs text-lavender/70 text-center mb-2">
                  Stop music after
                </p>

                <div className="grid grid-cols-3 gap-2">

                  <button
                    onClick={() =>
                      setSleepTimer(15)
                    }
                    className="py-2 rounded-xl bg-white/5 text-white text-sm hover:bg-white/10"
                  >
                    15 min
                  </button>

                  <button
                    onClick={() =>
                      setSleepTimer(30)
                    }
                    className="py-2 rounded-xl bg-white/5 text-white text-sm hover:bg-white/10"
                  >
                    30 min
                  </button>

                  <button
                    onClick={() =>
                      setSleepTimer(60)
                    }
                    className="py-2 rounded-xl bg-white/5 text-white text-sm hover:bg-white/10"
                  >
                    1 hour
                  </button>

                </div>

                {sleepTimerEnd && (
                  <button
                    onClick={
                      cancelSleepTimer
                    }
                    className="w-full mt-2 py-2 rounded-xl text-sm text-soft-pink hover:bg-white/5"
                  >
                    Cancel Timer
                  </button>
                )}

              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
