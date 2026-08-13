import axios from "axios";

const MUSICBRAINZ_URL = "https://musicbrainz.org/ws/2";
const COVER_ART_URL = "https://coverartarchive.org";

// MusicBrainz requires every application to identify itself with a meaningful
// User-Agent and to stay at or below one request per second.
const USER_AGENT = "LUNA-Music-App/1.0 (personal project)";
const MIN_REQUEST_INTERVAL = 1100;
const CACHE_TTL = 5 * 60 * 1000;
const MAX_RETRIES = 2;

const musicBrainzApi = axios.create({
  baseURL: MUSICBRAINZ_URL,
  timeout: 20000,
  headers: {
    "User-Agent": USER_AGENT,
    Accept: "application/json",
  },
});

const cache = new Map();
let requestChain = Promise.resolve();
let lastRequestAt = 0;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function cacheKey(path, params) {
  return `${path}?${new URLSearchParams(
    Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== null)
      .map(([key, value]) => [key, String(value)])
  ).toString()}`;
}

function enqueueRequest(task) {
  const run = requestChain.then(async () => {
    const wait = Math.max(
      0,
      MIN_REQUEST_INTERVAL - (Date.now() - lastRequestAt)
    );

    if (wait) await sleep(wait);
    lastRequestAt = Date.now();
    return task();
  });

  // Keep the queue alive even if one request fails.
  requestChain = run.catch(() => undefined);
  return run;
}

async function mbGet(path, params) {
  const key = cacheKey(path, params);
  const cached = cache.get(key);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const response = await enqueueRequest(async () => {
    let lastError;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
      try {
        const result = await musicBrainzApi.get(path, { params });
        return result.data;
      } catch (error) {
        lastError = error;
        const status = error?.response?.status;

        // Temporary MusicBrainz overload/rate-limit responses can recover.
        if ((status === 429 || status >= 500) && attempt < MAX_RETRIES) {
          await sleep(2500 * (attempt + 1));
          continue;
        }

        throw error;
      }
    }

    throw lastError;
  });

  cache.set(key, { timestamp: Date.now(), data: response });
  return response;
}

function escapeLucene(value) {
  return value.replace(/[\\+\-!(){}[\]^"~*?:/]/g, "\\$&");
}

function coverUrl(releaseId) {
  return releaseId
    ? `${COVER_ART_URL}/release/${releaseId}/front-250`
    : "";
}

function normalizeRecording(recording, fallbackArtist = "") {
  const release = recording.releases?.[0];
  const artists = recording["artist-credit"] || [];

  return {
    id: `mb-${recording.id}`,
    title: recording.title || "Unknown title",
    artist:
      artists
        .map((credit) => credit.name || credit.artist?.name)
        .filter(Boolean)
        .join(", ") ||
      fallbackArtist ||
      "Unknown artist",
    album: release?.title || "Unknown album",
    cover: coverUrl(release?.id),
    duration: recording.length
      ? Math.floor(recording.length / 1000)
      : 0,
    isLiked: false,
    metadataSource: "MusicBrainz",
    musicBrainzId: recording.id,
  };
}

/*
 * One MusicBrainz recording search can search both sides of what LUNA needs:
 *   - artistname / artist -> songs by an artist
 *   - recording -> song titles
 *
 * This is deliberately ONE API request per search. The previous implementation
 * made several requests for every keystroke and also loaded mood searches in
 * parallel, which violated MusicBrainz's one-request-per-second rule.
 */
export async function searchTracks(query) {
  const q = query.trim();
  if (!q) return [];

  try {
    const escaped = escapeLucene(q);
    const searchQuery =
      `artistname:"${escaped}" OR ` +
      `artist:"${escaped}" OR ` +
      `recording:"${escaped}"`;

    const data = await mbGet("/recording", {
      query: searchQuery,
      fmt: "json",
      limit: 40,
      inc: "artist-credits+releases",
    });

    return (data.recordings || []).map((recording) =>
      normalizeRecording(recording)
    );
  } catch (error) {
    const status = error?.response?.status;
    const detail = error?.response?.data?.error || error?.message || "Unknown error";

    console.error(
      "MusicBrainz search error:",
      status ? `HTTP ${status}` : error?.code || "REQUEST_ERROR",
      detail
    );

    return [];
  }
}

export async function getMoodSongs(mood) {
  const queries = {
    chill: "chill",
    happy: "happy",
    sad: "sad",
    focus: "focus",
  };

  return searchTracks(queries[mood] || mood);
}
