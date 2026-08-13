import { useEffect, useRef } from "react";

declare global {
  interface Window {
    YT: any;
    player: any;
    playerReady: boolean;
    onYouTubeIframeAPIReady: () => void;
  }
}

export function YouTubePlayer() {
  const ref = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    if (window.YT && window.YT.Player) {
      init();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(script);

    window.onYouTubeIframeAPIReady = init;
  }, []);

  function init() {
    if (!ref.current || window.player) return;

    window.playerReady = false;

    window.player = new window.YT.Player(ref.current, {
      height: "1",
      width: "1",
      videoId: "dQw4w9WgXcQ", // dummy
      playerVars: {
        autoplay: 0,
        controls: 0,
        playsinline: 1,
      },
      events: {
        onReady: () => {
          window.playerReady = true;
          window.player.pauseVideo();
          console.log("✅ YT Player Ready");
        },
      },
    });
  }

  return (
    <div
      ref={ref}
      style={{
        width: 1,
        height: 1,
        opacity: 0,
        position: "fixed",
        top: 0,
        left: 0,
        pointerEvents: "none",
      }}
    />
  );
}
