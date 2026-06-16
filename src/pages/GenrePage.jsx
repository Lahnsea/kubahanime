import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import AnimeCard, { AnimeCardSkeleton } from '../components/AnimeCard';
import { searchAnime } from '../utils/animeApi';
import { extractTitle } from '../hooks/useAnime';
import Navbar from '../components/Navbar';

// Genre name → MAL genre ID mapping
const GENRE_MAP = {
  'Action': 1,
  'Adventure': 2,
  'Avant Garde': 5,
  'Award Winning': 46,
  'Boys Love': 28,
  'Comedy': 4,
  'Drama': 8,
  'Fantasy': 10,
  'Girls Love': 26,
  'Gourmet': 47,
  'Horror': 14,
  'Mystery': 7,
  'Romance': 22,
  'Sci-Fi': 24,
  'Slice of Life': 36,
  'Sports': 30,
  'Supernatural': 37,
  'Suspense': 41,
};

export default function GenrePage() {
  const [searchParams] = useSearchParams();
  const genre = searchParams.get('genre') || 'Action';
  const genreId = GENRE_MAP[genre];

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setData([]);
    setPage(1);

    const url = new URL('/anime-proxy/anime', window.location.origin);
    url.searchParams.set('genres', genreId || 1);
    url.searchParams.set('order_by', 'score');
    url.searchParams.set('sort', 'desc');
    url.searchParams.set('limit', 24);
    url.searchParams.set('page', 1);
    url.searchParams.set('type', 'tv');

    fetch(url.toString(), { headers: { 'Content-Type': 'application/json' } })
      .then(res => res.json())
      .then(json => {
        if (!cancelled) {
          setData(json.data ?? []);
          setHasMore(json.pagination?.has_next_page ?? false);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [genre, genreId]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    setLoading(true);

    const url = new URL('/anime-proxy/anime', window.location.origin);
    url.searchParams.set('genres', genreId || 1);
    url.searchParams.set('order_by', 'score');
    url.searchParams.set('sort', 'desc');
    url.searchParams.set('limit', 24);
    url.searchParams.set('page', nextPage);
    url.searchParams.set('type', 'tv');

    fetch(url.toString(), { headers: { 'Content-Type': 'application/json' } })
      .then(res => res.json())
      .then(json => {
        setData(prev => [...prev, ...(json.data ?? [])]);
        setHasMore(json.pagination?.has_next_page ?? false);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  return (
    <>
      <div style={{ paddingTop: 'var(--navbar-height)', minHeight: '100vh', paddingBottom: '64px' }}>
        {/* Genre Header Banner — Crunchyroll orange */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(244,117,33,0.12) 0%, rgba(255,140,58,0.06) 60%, transparent 100%)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '44px 24px 36px',
          marginBottom: '0',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Accent side bar */}
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: 4, background: 'var(--gradient-accent)',
          }} />
          <div className="container">
            {/* Breadcrumb */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '14px' }}>
              <Link to="/" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>›</span>
              <Link to="/genre" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'none' }}>Genre</Link>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>›</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 600 }}>{genre}</span>
            </div>
            <h1 style={{
              fontFamily: 'Outfit, sans-serif', fontWeight: 900,
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              background: 'var(--gradient-accent)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '8px', letterSpacing: '-0.02em',
            }}>
              🎭 Genre: {genre}
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Anime bergenre <strong style={{ color: 'var(--accent-primary)' }}>{genre}</strong> dengan rating terbaik
            </p>

            {/* Genre Pills */}
            <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap' }}>
              {Object.keys(GENRE_MAP).map(g => (
                <Link
                  key={g}
                  to={`/genre?genre=${encodeURIComponent(g)}`}
                  style={{
                    padding: '6px 15px',
                    borderRadius: '99px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    background: g === genre ? 'var(--accent-primary)' : 'var(--bg-elevated)',
                    color: g === genre ? 'white' : 'var(--text-secondary)',
                    border: `1px solid ${g === genre ? 'transparent' : 'var(--border-card)'}`,
                    transition: 'var(--transition)',
                    boxShadow: g === genre ? '0 0 14px rgba(244,117,33,0.4)' : 'none',
                  }}
                  onMouseEnter={e => { if (g !== genre) { e.currentTarget.style.borderColor = 'rgba(244,117,33,0.4)'; e.currentTarget.style.color = 'var(--accent-primary)'; } }}
                  onMouseLeave={e => { if (g !== genre) { e.currentTarget.style.borderColor = 'var(--border-card)'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
                >
                  {g}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Anime Grid */}
        <div className="container" style={{ paddingTop: '36px' }}>
          {error ? (
            <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⚠️</div>
              <p>Gagal memuat anime. Coba lagi nanti.</p>
            </div>
          ) : (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: '16px',
                marginBottom: '32px',
              }}>
                {loading && data.length === 0
                  ? Array.from({ length: 24 }).map((_, i) => <AnimeCardSkeleton key={i} />)
                  : data.map((anime, i) => (
                    <AnimeCard key={`genre-${anime.mal_id}-${i}`} anime={anime} index={i} />
                  ))
                }
              </div>

              {hasMore && (
                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="btn-primary"
                    style={{ padding: '12px 32px', opacity: loading ? 0.6 : 1 }}
                  >
                    {loading ? 'Memuat...' : 'Muat Lebih Banyak'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
