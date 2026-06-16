/**
 * Kubahanime — Anime API Utility
 *
 * Base URL: https://api.jikan.moe/v4 (Jikan API - Unofficial MyAnimeList API)
 * Rate limit: 3 requests/sec → we enforce 1 request per 350ms via a queue.
 */

const BASE_URL = '/anime-proxy';

// ─── Cache (sessionStorage, 10 minutes) ──────────────────────────────────────
const CACHE_PREFIX = 'kubahanime_v2_';
const CACHE_DURATION = 10 * 60 * 1000;

function getCached(key) {
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_DURATION) { sessionStorage.removeItem(CACHE_PREFIX + key); return null; }
    return data;
  } catch { return null; }
}

function setCache(key, data) {
  try { sessionStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ data, ts: Date.now() })); } catch { /* quota */ }
}

// ─── Request Queue (1 req per 350ms, deduplication) ─────────────────────────
const inflight = new Map();   // url → Promise  (dedup simultaneous calls)
let lastRequestTime = 0;

async function enqueue(url) {
  // Dedup: if same URL is already in flight, return that promise
  if (inflight.has(url)) return inflight.get(url);

  const promise = (async () => {
    // Rate-limit: ensure ≥350ms since last request
    const now = Date.now();
    const wait = Math.max(0, lastRequestTime + 350 - now);
    if (wait > 0) await new Promise(r => setTimeout(r, wait));
    lastRequestTime = Date.now();

    let retries = 3;
    let delay = 1000;

    while (retries > 0) {
      try {
        const res = await fetch(url, { headers: { 'Content-Type': 'application/json' } });

        if (res.status === 429) {
          // Jikan rate limit — wait longer and retry
          await new Promise(r => setTimeout(r, delay));
          lastRequestTime = Date.now() + delay; // push next slot further
          delay *= 2;
          retries--;
          continue;
        }

        if (!res.ok) throw new Error(`API ${res.status}`);
        const json = await res.json();
        return json;
      } catch (err) {
        retries--;
        if (retries === 0) throw err;
        await new Promise(r => setTimeout(r, delay));
        delay *= 2;
      }
    }
  })();

  inflight.set(url, promise);
  promise.finally(() => inflight.delete(url));
  return promise;
}

// ─── Core Fetch ───────────────────────────────────────────────────────────────
async function fetchAPI(endpoint, params = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`, window.location.origin);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.append(k, v);
  });

  const urlStr = url.pathname + url.search;

  // Return cache immediately if fresh
  const cached = getCached(urlStr);
  if (cached) return cached;

  // Otherwise go through the queue
  const json = await enqueue(url.toString());
  setCache(urlStr, json);
  return json;
}

// ─── Anime List APIs ──────────────────────────────────────────────────────────

/** Get current season's ongoing anime */
export async function getSeasonalAnime(page = 1, limit = 24) {
  return fetchAPI('/seasons/now', { page, limit });
}

/** Get top anime (popular) */
export async function getPopularAnime(page = 1, limit = 24) {
  return fetchAPI('/top/anime', { page, limit });
}

/** Search anime by title with optional filters */
export async function searchAnime(query, page = 1, limit = 24, filters = {}) {
  const params = { page, limit };
  if (query) params.q = query;
  if (filters.genres)    params.genres    = filters.genres;
  if (filters.type)      params.type      = filters.type;
  if (filters.status)    params.status    = filters.status;
  if (filters.order_by)  params.order_by  = filters.order_by;
  if (filters.sort)      params.sort      = filters.sort;
  if (filters.min_score) params.min_score = filters.min_score;
  if (filters.rating)    params.rating    = filters.rating;
  return fetchAPI('/anime', params);
}

/** Get detailed info for a single anime */
export async function getAnimeDetail(animeId) {
  return fetchAPI(`/anime/${animeId}`);
}

/** Get list of episodes for an anime */
export async function getAnimeEpisodes(animeId, page = 1) {
  return fetchAPI(`/anime/${animeId}/episodes`, { page });
}

/** Get legal/official streaming links */
export async function getAnimeStreaming(animeId) {
  return fetchAPI(`/anime/${animeId}/streaming`);
}

/** Get anime recommendations */
export async function getAnimeRecommendations(animeId) {
  return fetchAPI(`/anime/${animeId}/recommendations`);
}

/** Get list of anime genres */
export async function getAnimeGenres() {
  return fetchAPI('/genres/anime');
}

/** Get anime airing schedule */
export async function getAnimeSchedule(dayFilter = '', page = 1, limit = 25) {
  const params = { page, limit };
  if (dayFilter) params.filter = dayFilter;
  return fetchAPI('/schedules', params);
}

// ─── Extract Helpers ──────────────────────────────────────────────────────────

export function extractTitle(anime) {
  if (!anime) return 'Judul Tidak Diketahui';
  return anime.title_english || anime.title || 'Judul Tidak Diketahui';
}

export function extractCover(anime) {
  if (!anime) return '';
  return anime.images?.webp?.large_image_url || anime.images?.jpg?.large_image_url || '';
}

export function extractGenres(anime) {
  if (!anime || !anime.genres) return [];
  return anime.genres.map(g => g.name);
}

// ─── AniList ID Mapping ───────────────────────────────────────────────────────

const anilistCache = new Map();

export async function getAnilistIdFromMalId(malId) {
  if (anilistCache.has(malId)) return anilistCache.get(malId);

  const query = `query ($idMal: Int) { Media (idMal: $idMal, type: ANIME) { id } }`;
  try {
    const res = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ query, variables: { idMal: parseInt(malId, 10) } })
    });
    if (!res.ok) return null;
    const json = await res.json();
    const id = json.data?.Media?.id || null;
    anilistCache.set(malId, id);
    return id;
  } catch (err) {
    console.error('AniList mapping failed:', err);
    return null;
  }
}

/**
 * Returns the third-party iframe embed URL for watching an anime episode.
 */
export function getWatchEmbedUrl(anilistId, episodeNum = 1, server = 'sub') {
  if (server === 'dub') return `https://animeplay.cfd/stream/ani/${anilistId}/${episodeNum}/dub`;
  return `https://animeplay.cfd/stream/ani/${anilistId}/${episodeNum}/sub`;
}
