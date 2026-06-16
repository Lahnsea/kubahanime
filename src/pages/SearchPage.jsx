import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AnimeCard, { AnimeCardSkeleton } from '../components/AnimeCard';
import { searchAnime, getAnimeGenres } from '../utils/animeApi';

const TYPES   = ['TV', 'Movie', 'OVA', 'ONA', 'Special', 'Music'];
const STATUSES = [
  { value: 'airing',   label: 'Sedang Tayang' },
  { value: 'complete', label: 'Selesai' },
  { value: 'upcoming', label: 'Akan Datang' },
];
const ORDER_BY = [
  { value: 'score',      label: 'Score' },
  { value: 'popularity', label: 'Popularitas' },
  { value: 'episodes',   label: 'Jumlah Episode' },
  { value: 'rank',       label: 'Ranking' },
  { value: 'start_date', label: 'Tanggal Tayang' },
  { value: 'members',    label: 'Members' },
  { value: 'title',      label: 'Judul (A-Z)' },
];
const SCORES = [
  { value: '', label: 'Semua Skor' },
  { value: '9', label: '9+ (Masterpiece)' },
  { value: '8', label: '8+ (Great)' },
  { value: '7', label: '7+ (Good)' },
  { value: '6', label: '6+ (Fine)' },
  { value: '5', label: '5+ (Average)' },
];

function FilterSelect({ label, value, onChange, children }) {
  return (
    <div>
      <div className="filter-label">{label}</div>
      <div style={{ position: 'relative' }}>
        <select value={value} onChange={e => onChange(e.target.value)} className="filter-select">
          {children}
        </select>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5"
          style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </div>
    </div>
  );
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [inputValue, setInputValue] = useState(query);
  const [results, setResults]       = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [page, setPage]             = useState(1);
  const [hasMore, setHasMore]       = useState(false);
  const [genres, setGenres]         = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(true);

  // Filters
  const [filterType,    setFilterType]    = useState('');
  const [filterStatus,  setFilterStatus]  = useState('');
  const [filterGenre,   setFilterGenre]   = useState('');
  const [filterOrderBy, setFilterOrderBy] = useState('score');
  const [filterSort,    setFilterSort]    = useState('desc');
  const [filterScore,   setFilterScore]   = useState('');

  // Load genre list once
  useEffect(() => {
    getAnimeGenres().then(res => setGenres(res?.data ?? [])).catch(() => {});
  }, []);

  const doSearch = useCallback(async (q, p, append = false) => {
    setLoading(true);
    setError(null);
    try {
      const filters = {
        type:      filterType    || undefined,
        status:    filterStatus  || undefined,
        genres:    filterGenre   || undefined,
        order_by:  filterOrderBy || undefined,
        sort:      filterSort    || undefined,
        min_score: filterScore   || undefined,
      };
      const res = await searchAnime(q, p, 24, filters);
      const data = res.data ?? [];
      setResults(prev => append ? [...prev, ...data] : data);
      setHasMore(res.pagination?.has_next_page ?? false);
      setPage(p);
    } catch (err) {
      setError(err.message || 'Pencarian gagal.');
    } finally {
      setLoading(false);
    }
  }, [filterType, filterStatus, filterGenre, filterOrderBy, filterSort, filterScore]);

  // Run when query or filters change
  useEffect(() => {
    setInputValue(query);
    setResults([]);
    setPage(1);
    if (!query.trim() && !filterType && !filterStatus && !filterGenre) {
      setLoading(false);
      return;
    }
    const timer = setTimeout(() => doSearch(query, 1, false), 350);
    return () => clearTimeout(timer);
  }, [query, filterType, filterStatus, filterGenre, filterOrderBy, filterSort, filterScore]); // eslint-disable-line

  const handleSearch = (e) => {
    e.preventDefault();
    if (inputValue.trim()) setSearchParams({ q: inputValue.trim() });
    else doSearch('', 1, false);
  };

  const loadMore = () => doSearch(query, page + 1, true);

  const resetFilters = () => {
    setFilterType(''); setFilterStatus(''); setFilterGenre('');
    setFilterOrderBy('score'); setFilterSort('desc'); setFilterScore('');
  };

  const hasActiveFilters = filterType || filterStatus || filterGenre || filterScore || filterOrderBy !== 'score' || filterSort !== 'desc';

  return (
    <div style={{ paddingTop: 'var(--navbar-height)', minHeight: '100vh' }}>
      <div className="container" style={{ paddingTop: '36px', paddingBottom: '72px' }}>

        {/* ── Page Header ─────────────────────────────────────────────── */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
            <Link to="/" style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Home</Link>
            <span style={{ color: 'var(--text-muted)' }}>›</span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Pencarian</span>
          </div>
          <h1 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '2.2rem', marginBottom: '20px', letterSpacing: '-0.02em' }}>
            {query ? (
              <>Hasil: <span className="gradient-text">"{query}"</span></>
            ) : (
              <span className="gradient-text">Cari Anime</span>
            )}
          </h1>

          {/* Search form */}
          <form onSubmit={handleSearch} className="search-form" style={{ display: 'flex', gap: '10px', maxWidth: '680px' }}>
            <div style={{
              flex: 1, display: 'flex', alignItems: 'center', gap: '12px',
              padding: '0 16px', borderRadius: 'var(--radius-md)',
              background: 'var(--bg-elevated)', border: '1px solid var(--border-card)',
              transition: 'var(--transition)',
            }}
              onFocusCapture={e => e.currentTarget.style.borderColor = 'var(--border-accent)'}
              onBlurCapture={e => e.currentTarget.style.borderColor = 'var(--border-card)'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              <input
                type="text" value={inputValue} onChange={e => setInputValue(e.target.value)}
                placeholder="Cari judul anime..." autoFocus
                style={{
                  flex: 1, padding: '12px 0', background: 'none', border: 'none',
                  color: 'var(--text-primary)', fontFamily: 'Outfit', fontSize: '0.95rem', outline: 'none',
                }}
              />
              {inputValue && (
                <button type="button" onClick={() => { setInputValue(''); setSearchParams({}); }}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', fontSize: '0.8rem' }}>
                  ✕
                </button>
              )}
            </div>
            <button type="submit" className="btn-primary" style={{ padding: '12px 24px', whiteSpace: 'nowrap' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              Cari
            </button>
          </form>
        </div>

        {/* ── MAL-style Filter Panel ─────────────────────────────────── */}
        <div style={{
          background: 'var(--bg-elevated)', border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-xl)', marginBottom: '28px', overflow: 'hidden',
        }}>
          {/* Filter toggle header */}
          <button onClick={() => setFiltersOpen(o => !o)} style={{
            width: '100%', padding: '14px 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'none', border: 'none', cursor: 'pointer',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2">
                <path d="M22 3H2l8 9.46V19l4 2V12.46z"/>
              </svg>
              <span style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                Filter Pencarian
              </span>
              {hasActiveFilters && (
                <span style={{
                  padding: '2px 8px', borderRadius: '99px', fontSize: '0.65rem', fontWeight: 700,
                  background: 'var(--accent-primary)', color: 'white', letterSpacing: '0.04em',
                }}>AKTIF</span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {hasActiveFilters && (
                <button onClick={e => { e.stopPropagation(); resetFilters(); }}
                  style={{ fontSize: '0.72rem', color: 'var(--accent-primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
                  Reset Filter
                </button>
              )}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5"
                style={{ transition: 'transform 0.3s', transform: filtersOpen ? 'rotate(180deg)' : 'rotate(0)' }}>
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </div>
          </button>

          {filtersOpen && (
            <div style={{
              padding: '0 20px 20px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '14px',
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '18px',
              animation: 'fadeIn 0.25s ease',
            }}>
              {/* Type */}
              <FilterSelect label="Tipe" value={filterType} onChange={setFilterType}>
                <option value="">Semua Tipe</option>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </FilterSelect>

              {/* Status */}
              <FilterSelect label="Status" value={filterStatus} onChange={setFilterStatus}>
                <option value="">Semua Status</option>
                {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </FilterSelect>

              {/* Genre */}
              <FilterSelect label="Genre" value={filterGenre} onChange={setFilterGenre}>
                <option value="">Semua Genre</option>
                {genres.map(g => <option key={g.mal_id} value={g.mal_id}>{g.name}</option>)}
              </FilterSelect>

              {/* Min Score */}
              <FilterSelect label="Minimum Skor" value={filterScore} onChange={setFilterScore}>
                {SCORES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </FilterSelect>

              {/* Order By */}
              <FilterSelect label="Urutkan Berdasarkan" value={filterOrderBy} onChange={setFilterOrderBy}>
                {ORDER_BY.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </FilterSelect>

              {/* Sort Direction */}
              <FilterSelect label="Arah Urutan" value={filterSort} onChange={setFilterSort}>
                <option value="desc">Tertinggi ke Terendah</option>
                <option value="asc">Terendah ke Tertinggi</option>
              </FilterSelect>
            </div>
          )}
        </div>

        {/* Results count */}
        {!loading && results.length > 0 && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '18px' }}>
            Menampilkan <strong style={{ color: 'var(--text-primary)' }}>{results.length}</strong> hasil{hasMore ? '+' : ''}{query ? ` untuk "${query}"` : ''}
          </p>
        )}

        {/* ── Results Grid ──────────────────────────────────────────── */}
        {!query.trim() && !filterType && !filterStatus && !filterGenre ? (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🔍</div>
            <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, marginBottom: '8px', fontSize: '1.5rem' }}>Mulai Pencarianmu</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Masukkan judul anime atau gunakan filter untuk menemukan anime yang kamu cari.</p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {['One Piece', 'Naruto', 'Bleach', 'Attack on Titan', 'Jujutsu Kaisen', 'Demon Slayer'].map(t => (
                <button key={t} onClick={() => { setInputValue(t); setSearchParams({ q: t }); }}
                  style={{
                    padding: '8px 18px', borderRadius: '99px',
                    background: 'var(--bg-elevated)', border: '1px solid var(--border-card)',
                    color: 'var(--text-secondary)', fontSize: '0.82rem', cursor: 'pointer',
                    fontFamily: 'Outfit', fontWeight: 600, transition: 'var(--transition)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-accent)'; e.currentTarget.style.color = 'var(--accent-primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-card)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >{t}</button>
              ))}
            </div>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>😕</div>
            <p>{error}</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(152px, 1fr))', gap: '16px', marginBottom: '32px' }}>
              {loading && results.length === 0
                ? Array.from({ length: 12 }).map((_, i) => <AnimeCardSkeleton key={i} />)
                : results.length === 0
                  ? (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                      <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🎌</div>
                      <p style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.1rem', marginBottom: '8px' }}>
                        Tidak ada hasil ditemukan
                      </p>
                      <p style={{ fontSize: '0.875rem' }}>Coba kata kunci lain atau ubah filter</p>
                    </div>
                  )
                  : results.map((anime, i) => <AnimeCard key={`${anime.mal_id}-${i}`} anime={anime} index={i} />)
              }
              {loading && results.length > 0 && Array.from({ length: 6 }).map((_, i) => <AnimeCardSkeleton key={`s-${i}`} />)}
            </div>

            {hasMore && !loading && (
              <div style={{ textAlign: 'center' }}>
                <button onClick={loadMore} className="btn-secondary">Muat Lebih Banyak</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
