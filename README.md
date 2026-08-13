# LUNA 🌙

LUNA is a small music-app project built around the original LUNA UI and local browser storage.

## LIVE DEMO 
https://luna-2-0-wine.vercel.app/

## What this version keeps

- Original LUNA visual design and star-field aesthetic
- Sleeping white cat illustration on Home
- OpenWeather weather/mood suggestion
- Gemini / Ask Luna backend
- YouTube API search used only to resolve playable YouTube video IDs
- Existing localStorage-based library behavior

## What was changed

- Added a loading/splash screen before authentication
- Added Sign In / Create Account
- Existing sessions go from loading directly to Home
- Authentication and user library data use localStorage; there is no MongoDB/database dependency
- Existing legacy localStorage library data is migrated to the first local account
- Replaced Spotify metadata with MusicBrainz through the backend
- Album artwork uses Cover Art Archive when a release image is available
- Added manually creatable playlists
- Added adding/removing songs from playlists
- Added playlist play controls
- Fixed pause/resume so playback continues from the current YouTube position
- Saved playback position in localStorage
- Added shuffle and repeat-off/all/one controls
- Added Play/Pause to the mini-player

## Important architecture note

MusicBrainz provides music metadata/catalog information. It does not provide the audio stream. LUNA continues to use the existing YouTube API + YouTube IFrame player for playback, so the Spotify dependency is removed without rewriting the existing playback architecture.

## Local setup

### Backend

```bash
cd backend
npm install
```

Copy `.env.example` to `.env` and add:

```env
PORT=5000
YOUTUBE_API_KEY=your_youtube_api_key
GEMINI_API_KEY=your_gemini_api_key
```

Then:

```bash
npm start
```

### Frontend

```bash
cd frontend
npm install
```

Copy `.env.example` to `.env` and set:

```env
VITE_BACKEND_URL=http://localhost:5000
VITE_OPENWEATHER_API_KEY=your_openweather_api_key
```

Then:

```bash
npm run dev
```

## Authentication limitation

Because this version intentionally does **not** use a database, accounts are stored only in the current browser's localStorage. This is suitable for a demo/project build, but it is not production-grade authentication. A real production login should use a server-side identity system and database.

## Music metadata

MusicBrainz is queried through the LUNA backend so the browser does not need to handle its request headers directly. The backend spaces MusicBrainz requests to respect its public API rate expectations.
