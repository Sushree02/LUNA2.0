const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export async function searchYouTubeVideo(
  query: string
): Promise<string | null> {
  try {
    const res = await fetch(
      `${BACKEND_URL}/api/youtube/search?q=${encodeURIComponent(query)}`
    );

    if (!res.ok) {
      console.error("Backend YouTube error");
      return null;
    }

    const data = await res.json();

    if (!data.videoId) {
      console.warn("No matching YouTube video found for:", query);
      return null;
    }

    return data.videoId;
  } catch (err) {
    console.error("YouTube fetch failed", err);
    return null;
  }
}
