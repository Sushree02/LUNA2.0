export async function searchYouTube(query) {
  try {
    const url = new URL("https://www.googleapis.com/youtube/v3/search");

    url.searchParams.set("part", "snippet");
    url.searchParams.set("type", "video");
    url.searchParams.set("maxResults", "1");
    url.searchParams.set("q", query);
    url.searchParams.set("key", process.env.YOUTUBE_API_KEY);

    const res = await fetch(url);

    if (!res.ok) {
      console.error("YouTube API error:", res.status);
      return null;
    }

    const data = await res.json();

    return data.items?.[0]?.id?.videoId ?? null;
  } catch (err) {
    console.error("YouTube fetch failed:", err);
    return null;
  }
}
