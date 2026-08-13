import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { LoadingScreen } from "./components/LoadingScreen";
import { AuthScreen } from "./components/AuthScreen";
import { HomePage } from "./components/HomePage";
import { SearchResults } from "./components/SearchResults";
import { PlayerScreen } from "./components/PlayerScreen";
import { LibraryScreen } from "./components/LibraryScreen";
import { BottomNav } from "./components/BottomNav";
import { YouTubePlayer } from "./components/YouTubePlayer";
import { MiniPlayer } from "./components/MiniPlayer";
import { AskLuna } from "./components/AskLuna";
import { getSession } from "@/auth";
import { useMusicStore } from "./store/useMusicStore";
import { getMoodFromWeatherAndTime } from "@/utils/moodEngine";

function Protected({ children }: { children: ReactNode }) {
  return getSession() ? children : <Navigate to="/auth" replace />;
}

function InitialRedirect() {
  return <Navigate to={getSession() ? "/" : "/auth"} replace />;
}

function AppRoutes() {
  const location = useLocation();
  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/auth" element={getSession() ? <Navigate to="/" replace /> : <AuthScreen />} />
          <Route path="/" element={<Protected><HomePage /></Protected>} />
          <Route path="/search" element={<Protected><SearchResults /></Protected>} />
          <Route path="/mood/:mood" element={<Protected><SearchResults /></Protected>} />
          <Route path="/player" element={<Protected><PlayerScreen /></Protected>} />
          <Route path="/library" element={<Protected><LibraryScreen /></Protected>} />
          <Route path="/ask-luna" element={<Protected><AskLuna /></Protected>} />
          <Route path="*" element={<InitialRedirect />} />
        </Routes>
      </AnimatePresence>
      {getSession() && <MiniPlayer />}
      {getSession() && <BottomNav />}
    </>
  );
}

function AppContent() {
  const { loadMoodBlocks, setWeather } = useMusicStore();

  useEffect(() => {
    if (getSession()) loadMoodBlocks();
  }, [loadMoodBlocks]);

  useEffect(() => {
    if (!getSession()) return;
    const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
    if (!API_KEY) return;
    let intervalId: number;

    const applyWeather = (data: any) => {
      const weatherMain = data.weather?.[0]?.main ?? "Clear";
      const temp = Math.round(data.main?.temp ?? 0);
      const city = data.name ?? "Unknown location";
      const hour = new Date().getHours();
      const timeLabel = hour >= 22 || hour < 5 ? "Night" : hour < 12 ? "Morning" : hour < 17 ? "Afternoon" : "Evening";
      const mood = getMoodFromWeatherAndTime(weatherMain, hour);
      setWeather(mood, `${weatherMain} · ${temp}°C`, timeLabel, city);
    };

    const fetchByCoords = async (lat: number, lon: number) => {
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
      if (res.ok) applyWeather(await res.json());
    };
    const fetchByCity = async () => {
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=Delhi&units=metric&appid=${API_KEY}`);
      if (res.ok) applyWeather(await res.json());
    };
    const resolveWeather = () => {
      if ("geolocation" in navigator) navigator.geolocation.getCurrentPosition((pos) => fetchByCoords(pos.coords.latitude, pos.coords.longitude), fetchByCity);
      else fetchByCity();
    };
    resolveWeather();
    intervalId = window.setInterval(resolveWeather, 30 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [setWeather]);

  return (
    <>
      <YouTubePlayer />
      <div className="pb-32"><AppRoutes /></div>
    </>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);
  return (
    <BrowserRouter>
      {isLoading ? <LoadingScreen onLoadComplete={() => setIsLoading(false)} /> : <AppContent />}
    </BrowserRouter>
  );
}

export default App;
