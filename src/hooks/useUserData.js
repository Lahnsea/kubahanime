import { useCallback } from 'react';
import {
  doc, setDoc, deleteDoc, getDoc,
  collection, getDocs, orderBy, query,
  serverTimestamp, limit,
} from 'firebase/firestore';
import { db, isFirebaseMocked } from '../firebase';
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

  const getFavorites = useCallback(async () => {
    if (!user) return [];
    if (isFirebaseMocked) {
      const list = JSON.parse(localStorage.getItem(`mock_favorites_${user.uid}`) || '[]');
      return list;
    }
    const col = collection(db, 'users', user.uid, 'favorites');
    const q = query(col, orderBy('addedAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data());
  }, [user]);

  const isFavorite = useCallback(async (animeId) => {
    if (!user) return false;
    if (isFirebaseMocked) {
      const list = await getFavorites();
      return list.some(item => item.id === animeId.toString());
    }
    const ref = doc(db, 'users', user.uid, 'favorites', animeId.toString());
    const snap = await getDoc(ref);
    return snap.exists();
  }, [user, getFavorites]);

  const addFavorite = useCallback(async (anime) => {
    if (!user) return false;
    const animeId = (anime.mal_id || anime.id).toString();
    if (isFirebaseMocked) {
      const list = await getFavorites();
      if (!list.some(item => item.id === animeId)) {
        const newItem = {
          ...buildAnimeSnapshot(anime),
          addedAt: { seconds: Math.floor(Date.now() / 1000) },
        };
        list.unshift(newItem);
        localStorage.setItem(`mock_favorites_${user.uid}`, JSON.stringify(list));
      }
      return true;
    }
    const ref = doc(db, 'users', user.uid, 'favorites', animeId);
    await setDoc(ref, {
      ...buildAnimeSnapshot(anime),
      addedAt: serverTimestamp(),
    });
    return true;
  }, [user, getFavorites]);

  const removeFavorite = useCallback(async (animeId) => {
    if (!user) return false;
    if (isFirebaseMocked) {
      const list = await getFavorites();
      const filtered = list.filter(item => item.id !== animeId.toString());
      localStorage.setItem(`mock_favorites_${user.uid}`, JSON.stringify(filtered));
      return true;
    }
    const ref = doc(db, 'users', user.uid, 'favorites', animeId.toString());
    await deleteDoc(ref);
    return true;
  }, [user, getFavorites]);

  return { isFavorite, addFavorite, removeFavorite, getFavorites };
}

// ── Watchlist (Ganti Readlist) ───────────────────────────────────────────────

export function useWatchlist() {
  const { user } = useAuth();

  const getWatchlist = useCallback(async () => {
    if (!user) return [];
    if (isFirebaseMocked) {
      const list = JSON.parse(localStorage.getItem(`mock_watchlist_${user.uid}`) || '[]');
      return list;
    }
    const col = collection(db, 'users', user.uid, 'watchlist');
    const q = query(col, orderBy('addedAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data());
  }, [user]);

  const isInWatchlist = useCallback(async (animeId) => {
    if (!user) return false;
    if (isFirebaseMocked) {
      const list = await getWatchlist();
      return list.some(item => item.id === animeId.toString());
    }
    const ref = doc(db, 'users', user.uid, 'watchlist', animeId.toString());
    const snap = await getDoc(ref);
    return snap.exists();
  }, [user, getWatchlist]);

  const addToWatchlist = useCallback(async (anime) => {
    if (!user) return false;
    const animeId = (anime.mal_id || anime.id).toString();
    if (isFirebaseMocked) {
      const list = await getWatchlist();
      if (!list.some(item => item.id === animeId)) {
        const newItem = {
          ...buildAnimeSnapshot(anime),
          addedAt: { seconds: Math.floor(Date.now() / 1000) },
        };
        list.unshift(newItem);
        localStorage.setItem(`mock_watchlist_${user.uid}`, JSON.stringify(list));
      }
      return true;
    }
    const ref = doc(db, 'users', user.uid, 'watchlist', animeId);
    await setDoc(ref, {
      ...buildAnimeSnapshot(anime),
      addedAt: serverTimestamp(),
    });
    return true;
  }, [user, getWatchlist]);

  const removeFromWatchlist = useCallback(async (animeId) => {
    if (!user) return false;
    if (isFirebaseMocked) {
      const list = await getWatchlist();
      const filtered = list.filter(item => item.id !== animeId.toString());
      localStorage.setItem(`mock_watchlist_${user.uid}`, JSON.stringify(filtered));
      return true;
    }
    const ref = doc(db, 'users', user.uid, 'watchlist', animeId.toString());
    await deleteDoc(ref);
    return true;
  }, [user, getWatchlist]);

  return { isInWatchlist, addToWatchlist, removeFromWatchlist, getWatchlist };
}

// ── History ───────────────────────────────────────────────────────────────────

export function useHistory() {
  const { user } = useAuth();

  const getHistory = useCallback(async (limitCount = 50) => {
    if (!user) return [];
    if (isFirebaseMocked) {
      const list = JSON.parse(localStorage.getItem(`mock_history_${user.uid}`) || '[]');
      return list.slice(0, limitCount);
    }
    const col = collection(db, 'users', user.uid, 'history');
    const q = query(col, orderBy('watchedAt', 'desc'), limit(limitCount));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data());
  }, [user]);

  const saveHistory = useCallback(async (anime, episodeNum, episodeTitle = '') => {
    if (!user || !anime) return false;
    const animeId = (anime.mal_id || anime.id).toString();
    if (isFirebaseMocked) {
      const list = await getHistory();
      const filtered = list.filter(item => item.id !== animeId);
      const newItem = {
        ...buildAnimeSnapshot(anime),
        lastEpisodeNum: episodeNum,
        lastEpisodeTitle: episodeTitle,
        watchedAt: { seconds: Math.floor(Date.now() / 1000) },
      };
      filtered.unshift(newItem);
      localStorage.setItem(`mock_history_${user.uid}`, JSON.stringify(filtered));
      return true;
    }
    const ref = doc(db, 'users', user.uid, 'history', animeId);
    await setDoc(ref, {
      ...buildAnimeSnapshot(anime),
      lastEpisodeNum: episodeNum,
      lastEpisodeTitle: episodeTitle,
      watchedAt: serverTimestamp(),
    }, { merge: true });
    return true;
  }, [user, getHistory]);

  const clearHistory = useCallback(async (animeId = null) => {
    if (!user) return;
    if (isFirebaseMocked) {
      if (animeId) {
        const list = await getHistory();
        const filtered = list.filter(item => item.id !== animeId.toString());
        localStorage.setItem(`mock_history_${user.uid}`, JSON.stringify(filtered));
      } else {
        localStorage.removeItem(`mock_history_${user.uid}`);
      }
      return;
    }
    if (animeId) {
      const ref = doc(db, 'users', user.uid, 'history', animeId.toString());
      await deleteDoc(ref);
    } else {
      const col = collection(db, 'users', user.uid, 'history');
      const snap = await getDocs(col);
      await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
    }
  }, [user, getHistory]);

  return { saveHistory, getHistory, clearHistory };
}
