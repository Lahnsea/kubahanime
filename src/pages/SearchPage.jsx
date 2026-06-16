import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AnimeCard, { AnimeCardSkeleton } from '../components/AnimeCard';
import { searchAnime } from '../utils/animeApi';
import { extractTitle, extractCover } from '../hooks/useAnime';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [inputValue, setInputValue] = useState(query);

  useEffect(() => {
    setInputValue(query);
    setPage(1);
    setResults([]);

    if (!query.trim()) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const timer = setTimeout(() => {
      searchAnime(query, 1, 24)
        .then(res => {
          if (!cancelled) {
            setResults(res.data ?? []);
            setHasMore(res.pagination?.has_next_page ?? false);
            setLoading(false);
          }
        })
        .catch(err => {
          if (!cancelled) {
            setError(err.message || 'Pencarian gagal.');
            setLoading(false);
          }
        });
    }, 400);

    return () => { cancelled = true; clearTimeout(timer); };
  }, [query]);

  const loadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const nextPage = page + 1;
    try {
      const res = await searchAnime(query, nextPage, 24);
      setResults(prev => [...prev, ...(res.data ?? [])]);
      setHasMore(res.pagination?.has_next_page ?? false);
      setPage(nextPage);
    } catch (err) {
      setError(err.message || 'Gagal memuat lebih banyak.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setSearchParams({ q: inputValue.trim() });
    }
  };

  return (
    <div style={{ paddingTop: 'var(--navbar-height)' }}>
      <div className="container" style={{ paddingTop: '40px', paddingBottom: '64px' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Link to="/" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none' }}>Home</Link>
            <span style={{ color: 'var(--text-muted)' }}>›</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Pencarian</span>
          </div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '2rem', marginBottom: '20px' }}>
            {query ? (
              <>Hasil Pencarian: <span className="gradient-text">"{query}"</span></>
            ) : (
              <span className="gradient-text">Cari Anime</span>
            )}
          </h1>

          {/* Search Bar */}
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', maxWidth: '600px' }}>
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Cari judul anime..."
              autoFocus
              style={{
                flex: 1,
                padding: '12px 18px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-card)',
                color: 'var(--text-primary)',
                fontFamily: 'Outfit, sans-serif',
                fontSize: '1rem',
                outline: 'none',
                transition: 'var(--transition)',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--border-accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-card)'}
            />
            <button type="submit" className="btn-primary" style={{ padding: '12px 24px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              Cari
            </button>
          </form>
        </div>

        {/* Results Count */}
        {!loading && results.length > 0 && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
            Menampilkan {results.length} hasil{hasMore ? '+' : ''} untuk "{query}"
          </p>
        )}

        {/* Results Grid */}
        {!query.trim() ? (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🔍</div>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, marginBottom: '8px' }}>
              Ketik untuk mulai mencari
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              Masukkan judul anime yang ingin kamu cari
            </p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>😕</div>
            <p>{error}</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px', marginBottom: '32px' }}>
              {loading && results.length === 0
                ? Array.from({ length: 12 }).map((_, i) => <AnimeCardSkeleton key={i} />)
                : results.length === 0
                ? (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🎌</div>
                    <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '1.1rem', marginBottom: '8px' }}>
                      Tidak ada hasil untuk "{query}"
                    </p>
                    <p style={{ fontSize: '0.875rem' }}>
                      Coba kata kunci lain atau periksa ejaan
                    </p>
                  </div>
                )
                : results.map((anime, i) => (
                  <AnimeCard key={`search-${anime.mal_id}-${i}`} anime={anime} index={i} />
                ))
              }
              {loading && results.length > 0 && Array.from({ length: 6 }).map((_, i) => <AnimeCardSkeleton key={`more-${i}`} />)}
            </div>

            {hasMore && !loading && (
              <div style={{ textAlign: 'center' }}>
                <button onClick={loadMore} className="btn-secondary">
                  Muat Lebih Banyak
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
