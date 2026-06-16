import { useCallback } from 'react';
import {
  doc, setDoc, deleteDoc, getDoc,
  collection, getDocs, orderBy, query,
  serverTimestamp, limit,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { extractTitle, extractCover } from './useAnime';

/**
 * Semua data user anime disimpan di:
 * /users/{uid}/favorites/{animeId}
 * /users/{uid}/watchlist/{animeId}
 * /users/{uid}/history/{animeId}
 */

// ── Helper: build anime snapshot untuk disimpan ─────────────────────────────
function buildAnimeSnapshot(anime) {
  if (!anime) return {};
  const title = extractTitle(anime);
  const cover = extractCover(anime);
  return {
    id: (anime.mal_id || anime.id).toString(),
    title,
    cover,
    type: anime.type || '',
    status: anime.status || '',
    score: anime.score || 0,
  };
}

// ── Favorites ────────────────────────────────────────────────────────────────

export function useFavorites() {
  const { user } = useAuth();

  const isFavorite = useCallback(async (animeId) => {
    if (!user) return false;
    const ref = doc(db, 'users', user.uid, 'favorites', animeId.toString());
    const snap = await getDoc(ref);
    return snap.exists();
  }, [user]);

  const addFavorite = useCallback(async (anime) => {
    if (!user) return false;
    const animeId = (anime.mal_id || anime.id).toString();
    const ref = doc(db, 'users', user.uid, 'favorites', animeId);
    await setDoc(ref, {
      ...buildAnimeSnapshot(anime),
      addedAt: serverTimestamp(),
    });
    return true;
  }, [user]);

  const removeFavorite = useCallback(async (animeId) => {
    if (!user) return false;
    const ref = doc(db, 'users', user.uid, 'favorites', animeId.toString());
    await deleteDoc(ref);
    return true;
  }, [user]);

  const getFavorites = useCallback(async () => {
    if (!user) return [];
    const col = collection(db, 'users', user.uid, 'favorites');
    const q = query(col, orderBy('addedAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data());
  }, [user]);

  return { isFavorite, addFavorite, removeFavorite, getFavorites };
}

// ── Watchlist (Ganti Readlist) ───────────────────────────────────────────────

export function useWatchlist() {
  const { user } = useAuth();

  const isInWatchlist = useCallback(async (animeId) => {
    if (!user) return false;
    const ref = doc(db, 'users', user.uid, 'watchlist', animeId.toString());
    const snap = await getDoc(ref);
    return snap.exists();
  }, [user]);

  const addToWatchlist = useCallback(async (anime) => {
    if (!user) return false;
    const animeId = (anime.mal_id || anime.id).toString();
    const ref = doc(db, 'users', user.uid, 'watchlist', animeId);
    await setDoc(ref, {
      ...buildAnimeSnapshot(anime),
      addedAt: serverTimestamp(),
    });
    return true;
  }, [user]);

  const removeFromWatchlist = useCallback(async (animeId) => {
    if (!user) return false;
    const ref = doc(db, 'users', user.uid, 'watchlist', animeId.toString());
    await deleteDoc(ref);
    return true;
  }, [user]);

  const getWatchlist = useCallback(async () => {
    if (!user) return [];
    const col = collection(db, 'users', user.uid, 'watchlist');
    const q = query(col, orderBy('addedAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data());
  }, [user]);

  return { isInWatchlist, addToWatchlist, removeFromWatchlist, getWatchlist };
}

// ── History ───────────────────────────────────────────────────────────────────

export function useHistory() {
  const { user } = useAuth();

  const saveHistory = useCallback(async (anime, episodeNum, episodeTitle = '') => {
    if (!user || !anime) return false;
    const animeId = (anime.mal_id || anime.id).toString();
    const ref = doc(db, 'users', user.uid, 'history', animeId);
    await setDoc(ref, {
      ...buildAnimeSnapshot(anime),
      lastEpisodeNum: episodeNum,
      lastEpisodeTitle: episodeTitle,
      watchedAt: serverTimestamp(),
    }, { merge: true });
    return true;
  }, [user]);

  const getHistory = useCallback(async (limitCount = 50) => {
    if (!user) return [];
    const col = collection(db, 'users', user.uid, 'history');
    const q = query(col, orderBy('watchedAt', 'desc'), limit(limitCount));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data());
  }, [user]);

  const clearHistory = useCallback(async (animeId = null) => {
    if (!user) return;
    if (animeId) {
      // Delete a single history entry
      const ref = doc(db, 'users', user.uid, 'history', animeId.toString());
      await deleteDoc(ref);
    } else {
      // Delete all history entries
      const col = collection(db, 'users', user.uid, 'history');
      const snap = await getDocs(col);
      await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
    }
  }, [user]);

  return { saveHistory, getHistory, clearHistory };
}
