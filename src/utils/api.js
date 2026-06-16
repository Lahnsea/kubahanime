/**
 * Kubamanga — MangaDex API Utility
 * 
 * Strategi Bahasa:
 *  - Prioritas: Bahasa Indonesia (id)
 *  - Fallback:  Bahasa Inggris (en)
 * 
 * Base URL: https://api.mangadex.org
 * Cover CDN: https://uploads.mangadex.org/covers/{mangaId}/{filename}
 */

const BASE_URL = '/api-proxy';
const COVER_CDN = '/uploads-proxy/covers';

// ─── Language constants ──────────────────────────────────────────────────────
export const LANG_ID = 'id';   // Bahasa Indonesia
export const LANG_EN = 'en';   // English (fallback)

const defaultHeaders = {
  'Content-Type': 'application/json',
};

async function fetchAPI(endpoint, params = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`, window.location.origin);
  Object.entries(params).forEach(([key, val]) => {
    if (Array.isArray(val)) {
      val.forEach(v => url.searchParams.append(key, v));
    } else if (val !== undefined && val !== null) {
      url.searchParams.append(key, val);
    }
  });

  const res = await fetch(url.toString(), { headers: defaultHeaders });
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  return res.json();
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Get cover image URL */
export function getCoverUrl(mangaId, filename, size = 256) {
  return `${COVER_CDN}/${mangaId}/${filename}.${size}.jpg`;
}

/** Extract cover filename from manga relationships */
export function extractCover(manga) {
  const rel = manga.relationships?.find(r => r.type === 'cover_art');
  return rel?.attributes?.fileName ?? null;
}

/**
 * Extract title — prioritas bahasa Indonesia, fallback Inggris
 */
export function extractTitle(manga) {
  const titles = manga.attributes?.title ?? {};
  const altTitles = manga.attributes?.altTitles ?? [];

  // Try alt titles for Indonesian first
  for (const alt of altTitles) {
    if (alt['id']) return alt['id'];
  }

  return (
    titles['id'] ||
    titles['en'] ||
    titles['ja-ro'] ||
    titles['ja'] ||
    Object.values(titles)[0] ||
    'Judul Tidak Diketahui'
  );
}

/** Extract author name */
export function extractAuthor(manga) {
  const author = manga.relationships?.find(r => r.type === 'author');
  return author?.attributes?.name ?? null;
}

/**
 * Extract description — prioritas Indonesia, fallback Inggris
 */
export function extractDescription(manga) {
  const desc = manga.attributes?.description ?? {};
  return desc['id'] || desc['en'] || Object.values(desc)[0] || '';
}

/** Detect chapter language label */
export function getLangLabel(lang) {
  if (lang === 'id') return '🇮🇩 Indonesia';
  if (lang === 'en') return '🇬🇧 English';
  return lang?.toUpperCase() || '?';
}

/** Construct page image URL from at-home response */
export function getPageUrl(baseUrl, hash, filename, quality = 'data') {
  const localBase = baseUrl.replace(/^https:\/\/.*\.mangadex\.org/, '/uploads-proxy');
  return `${localBase}/${quality}/${hash}/${filename}`;
}

// ─── Manga List APIs ──────────────────────────────────────────────────────────

/**
 * Get popular manga — available in both ID + EN
 * Manga yang ada terjemahan Indonesia ATAU Inggris
 */
export async function getPopularManga(limit = 20, offset = 0) {
  return fetchAPI('/manga', {
    limit,
    offset,
    'order[followedCount]': 'desc',
    'includes[]': ['cover_art', 'author', 'artist'],
    'contentRating[]': ['safe', 'suggestive'],
    'availableTranslatedLanguage[]': [LANG_ID, LANG_EN],
  });
}

/**
 * Get popular manga yang HANYA ada terjemahan Indonesia
 */
export async function getPopularMangaID(limit = 20, offset = 0) {
  return fetchAPI('/manga', {
    limit,
    offset,
    'order[followedCount]': 'desc',
    'includes[]': ['cover_art', 'author', 'artist'],
    'contentRating[]': ['safe', 'suggestive'],
    'availableTranslatedLanguage[]': [LANG_ID],
  });
}

/**
 * Get latest updated manga — ID + EN
 */
export async function getLatestManga(limit = 20, offset = 0) {
  return fetchAPI('/manga', {
    limit,
    offset,
    'order[latestUploadedChapter]': 'desc',
    'includes[]': ['cover_art', 'author'],
    'contentRating[]': ['safe', 'suggestive'],
    'availableTranslatedLanguage[]': [LANG_ID, LANG_EN],
  });
}

/**
 * Search manga
 */
export async function searchManga(query, limit = 20, offset = 0) {
  return fetchAPI('/manga', {
    title: query,
    limit,
    offset,
    'includes[]': ['cover_art', 'author'],
    'contentRating[]': ['safe', 'suggestive'],
    'availableTranslatedLanguage[]': [LANG_ID, LANG_EN],
  });
}

/**
 * Get single manga detail
 */
export async function getMangaDetail(mangaId) {
  return fetchAPI(`/manga/${mangaId}`, {
    'includes[]': ['cover_art', 'author', 'artist', 'tag'],
  });
}

/**
 * Get manga statistics
 */
export async function getMangaStats(mangaId) {
  return fetchAPI(`/statistics/manga/${mangaId}`);
}

// ─── Chapter APIs ─────────────────────────────────────────────────────────────

/**
 * Fetch chapters for specific language(s)
 */
async function fetchChapters(mangaId, langs, limit = 96, offset = 0) {
  return fetchAPI(`/manga/${mangaId}/feed`, {
    limit,
    offset,
    'translatedLanguage[]': langs,
    'order[chapter]': 'desc',
    'includes[]': ['scanlation_group'],
    'contentRating[]': ['safe', 'suggestive'],
  });
}

/**
 * Get manga chapters dengan strategi prioritas Indonesia → fallback Inggris
 * 
 * Cara kerja:
 * 1. Fetch chapter Bahasa Indonesia
 * 2. Jika ada → return ID chapters
 * 3. Jika tidak ada → fetch + return EN chapters
 * 4. Return objek: { data, total, lang }
 */
export async function getMangaChaptersPriority(mangaId, limit = 96, offset = 0) {
  // Step 1: coba Indonesia dulu
  const idResult = await fetchChapters(mangaId, [LANG_ID], limit, offset);

  if (idResult.total > 0) {
    return {
      data: idResult.data ?? [],
      total: idResult.total ?? 0,
      lang: LANG_ID,
      langLabel: '🇮🇩 Indonesia',
    };
  }

  // Step 2: fallback ke Inggris
  const enResult = await fetchChapters(mangaId, [LANG_EN], limit, offset);
  return {
    data: enResult.data ?? [],
    total: enResult.total ?? 0,
    lang: LANG_EN,
    langLabel: '🇬🇧 English (fallback)',
  };
}

/**
 * Load more chapters dengan bahasa yang sudah ditentukan sebelumnya
 */
export async function getMangaChaptersByLang(mangaId, lang, limit = 96, offset = 0) {
  const result = await fetchChapters(mangaId, [lang], limit, offset);
  return {
    data: result.data ?? [],
    total: result.total ?? 0,
    lang,
  };
}

/**
 * Get chapter pages (at-home server)
 */
export async function getChapterPages(chapterId) {
  return fetchAPI(`/at-home/server/${chapterId}`);
}

/**
 * Get manga by IDs (bulk)
 */
export async function getMangaByIds(ids) {
  return fetchAPI('/manga', {
    'ids[]': ids,
    'includes[]': ['cover_art', 'author'],
    limit: ids.length,
  });
}
