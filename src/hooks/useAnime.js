import { useState, useEffect, useCallback } from 'react';
import {
  getSeasonalAnime,
  getPopularAnime,
  searchAnime,
  getAnimeDetail,
  getAnimeEpisodes,
  getAnimeStreaming,
  getAnimeRecommendations,
  getAnilistIdFromMalId,
  getAnimeSchedule,
  extractTitle,
  extractCover,
  extractGenres,
} from '../utils/animeApi';

// Re-export extract helpers
export {
  extractTitle,
  extractCover,
  extractGenres,
};

// ─── useSeasonalAnime (Sedang Tayang) ──────────────────────────────────────────
// staggerMs: delay before first request fires (prevents homepage burst)
export function useSeasonalAnime(initialLimit = 24, staggerMs = 0) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [limit, setLimit] = useState(initialLimit);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    // Sequential fetch: page 1, then page 2, etc. — respects the queue's 350ms gap
    const fetchSequential = async () => {
      if (staggerMs > 0) await new Promise(r => setTimeout(r, staggerMs));
      const perPage = 25;
      const pages = Math.ceil(limit / perPage);
      const combined = [];
      for (let i = 0; i < pages; i++) {
        if (cancelled) return;
        const res = await getSeasonalAnime(i + 1, perPage);
        combined.push(...(res.data ?? []));
      }
      if (!cancelled) {
        setData(combined.slice(0, limit));
        setLoading(false);
      }
    };

    fetchSequential().catch(err => {
      if (!cancelled) {
        setError(err.message || 'Gagal memuat seasonal anime.');
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [limit, staggerMs]);

  const loadMore = () => setLimit(prev => prev + 24);

  return { data, loading, error, loadMore };
}

// ─── usePopularAnime (Terpopuler) ──────────────────────────────────────────────
export function usePopularAnime(initialLimit = 24, staggerMs = 0) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [limit, setLimit] = useState(initialLimit);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const fetchSequential = async () => {
      if (staggerMs > 0) await new Promise(r => setTimeout(r, staggerMs));
      const perPage = 25;
      const pages = Math.ceil(limit / perPage);
      const combined = [];
      for (let i = 0; i < pages; i++) {
        if (cancelled) return;
        const res = await getPopularAnime(i + 1, perPage);
        combined.push(...(res.data ?? []));
      }
      if (!cancelled) {
        setData(combined.slice(0, limit));
        setLoading(false);
      }
    };

    fetchSequential().catch(err => {
      if (!cancelled) {
        setError(err.message || 'Gagal memuat anime populer.');
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [limit, staggerMs]);

  const loadMore = () => setLimit(prev => prev + 24);

  return { data, loading, error, loadMore };
}

// ─── useSearchAnime ─────────────────────────────────────────────────────────────
export function useSearchAnime() {
  const [query, setQuery] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query.trim()) {
      setData([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      setLoading(true);
      setError(null);
      searchAnime(query, 1, 20)
        .then(res => {
          if (!cancelled) {
            setData(res.data ?? []);
            setLoading(false);
          }
        })
        .catch(err => {
          if (!cancelled) {
            setError(err.message || 'Pencarian gagal.');
            setLoading(false);
          }
        });
    }, 600); // Debounce search request
    return () => { cancelled = true; clearTimeout(timer); };
  }, [query]);

  return { query, setQuery, data, loading, error };
}

// ─── useAnimeDetail ─────────────────────────────────────────────────────────────
export function useAnimeDetail(animeId) {
  const [anime, setAnime] = useState(null);
  const [streaming, setStreaming] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [anilistId, setAnilistId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!animeId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      getAnimeDetail(animeId).catch(() => null),
      getAnimeStreaming(animeId).catch(() => null),
      getAnimeRecommendations(animeId).catch(() => null),
      getAnilistIdFromMalId(animeId).catch(() => null),
    ])
      .then(([detailRes, streamingRes, recRes, aniId]) => {
        if (!cancelled) {
          setAnime(detailRes?.data ?? null);
          setStreaming(streamingRes?.data ?? []);
          setRecommendations(recRes?.data?.slice(0, 8) ?? []);
          setAnilistId(aniId);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err.message || 'Gagal memuat detail anime.');
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [animeId]);

  return { anime, streaming, recommendations, anilistId, loading, error };
}

// ─── useAnimeEpisodes ───────────────────────────────────────────────────────────
export function useAnimeEpisodes(animeId) {
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);

  useEffect(() => {
    if (!animeId) return;
    let cancelled = false;
    setLoading(true);
    getAnimeEpisodes(animeId, page)
      .then(res => {
        if (!cancelled) {
          // If page 1, replace episodes, otherwise append
          setEpisodes(prev => page === 1 ? (res.data ?? []) : [...prev, ...(res.data ?? [])]);
          setHasNext(res.pagination?.has_next_page ?? false);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err.message || 'Gagal memuat episode.');
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [animeId, page]);

  const loadMore = useCallback(() => {
    if (hasNext && !loading) {
      setPage(p => p + 1);
    }
  }, [hasNext, loading]);

  const reset = useCallback(() => {
    setPage(1);
    setEpisodes([]);
  }, []);

  return { episodes, loading, error, hasNext, loadMore, reset };
}

// ─── useAnimeSchedule (Jadwal Tayang) ──────────────────────────────────────────
export function useAnimeSchedule(initialDay = '', staggerMs = 0) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [day, setDay] = useState(initialDay);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const fetch = async () => {
      if (staggerMs > 0) await new Promise(r => setTimeout(r, staggerMs));
      if (cancelled) return;
      const res = await getAnimeSchedule(day, 1, 25);
      if (!cancelled) {
        setData(res.data ?? []);
        setLoading(false);
      }
    };

    fetch().catch(err => {
      if (!cancelled) {
        setError(err.message || 'Gagal memuat jadwal anime.');
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [day, staggerMs]);

  return { data, loading, error, day, setDay };
}

