import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAnimeDetail, useAnimeEpisodes, extractTitle, extractCover } from '../hooks/useAnime';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites, useWatchlist } from '../hooks/useUserData';
import AuthModal from '../components/AuthModal';
import AnimeCard from '../components/AnimeCard';

function EpisodeItem({ animeId, episodeNum, title, dateStr }) {
  return (
    <Link
      to={`/watch/${animeId}/episode/${episodeNum}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 18px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-card)',
        textDecoration: 'none',
        transition: 'var(--transition)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--border-accent)';
        e.currentTarget.style.background = 'var(--bg-elevated)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border-card)';
        e.currentTarget.style.background = 'var(--bg-card)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
        <div style={{
          width: 32, height: 32,
          borderRadius: '8px',
          background: 'var(--gradient-accent)',
          color: 'white',
          fontFamily: 'Outfit, sans-serif',
          fontWeight: 700,
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          {episodeNum}
        </div>
        <div style={{ minWidth: 0 }}>
          <h4 style={{
            fontSize: '0.9rem',
            color: 'var(--text-primary)',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {title || `Episode ${episodeNum}`}
          </h4>
        </div>
      </div>
      {dateStr && (
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {dateStr}
        </span>
      )}
    </Link>
  );
}

export default function AnimeDetailPage() {
  const { id } = useParams();
  const { anime, streaming, recommendations, anilistId, loading, error } = useAnimeDetail(id);
  const { episodes, loading: epLoading, hasNext, loadMore } = useAnimeEpisodes(id);
  
  const { isLoggedIn } = useAuth();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();

  const [fav, setFav] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    if (isLoggedIn && id) {
      isFavorite(id).then(setFav);
      isInWatchlist(id).then(setInWatchlist);
    }
  }, [isLoggedIn, id, isFavorite, isInWatchlist]);

  const toggleFavorite = async () => {
    if (!isLoggedIn) {
      setAuthOpen(true);
      return;
    }
    if (fav) {
      await removeFavorite(id);
      setFav(false);
    } else {
      await addFavorite(anime);
      setFav(true);
    }
  };

  const toggleWatchlistHandler = async () => {
    if (!isLoggedIn) {
      setAuthOpen(true);
      return;
    }
    if (inWatchlist) {
      await removeFromWatchlist(id);
      setInWatchlist(false);
    } else {
      await addToWatchlist(anime);
      setInWatchlist(true);
    }
  };

  if (loading) {
    return (
      <div style={{ paddingTop: 'var(--navbar-height)' }}>
        <div style={{ position: 'relative', height: 280, background: 'var(--bg-surface)' }} />
        <div className="container" style={{ position: 'relative', marginTop: -200, paddingBottom: 80 }}>
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
            <div className="skeleton" style={{ width: 180, height: 260, borderRadius: 'var(--radius-xl)' }} />
            <div style={{ flex: 1, minWidth: 280, paddingTop: 80 }}>
              <div className="skeleton" style={{ height: 36, width: '60%', marginBottom: 12 }} />
              <div className="skeleton" style={{ height: 16, width: '40%', marginBottom: 24 }} />
              <div className="skeleton" style={{ height: 80, width: '100%', marginBottom: 16 }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !anime) {
    return (
      <div style={{ paddingTop: 'var(--navbar-height)', textAlign: 'center', padding: '80px 24px' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>
          {error || 'Anime tidak ditemukan.'}
        </p>
        <Link to="/" className="btn-primary">Kembali ke Home</Link>
      </div>
    );
  }

  const title = extractTitle(anime);
  const coverUrl = extractCover(anime);
  const totalEpisodes = anime.episodes || 0;
  const rating = anime.score;
  const year = anime.year || anime.aired?.prop?.from?.year;
  const status = anime.status;
  const type = anime.type;
  const studio = anime.studios?.[0]?.name || '';
  const source = anime.source || '';
  const duration = anime.duration || '';
  const genres = anime.genres ?? [];

  // Generate fallback episode list if API episodes response is empty
  let displayEpisodes = episodes;
  if (!epLoading && episodes.length === 0 && totalEpisodes > 0) {
    displayEpisodes = Array.from({ length: totalEpisodes }).map((_, i) => ({
      mal_id: i + 1,
      episode: i + 1,
      title: `Episode ${i + 1}`,
    }));
  }

  return (
    <>
      <div style={{ paddingTop: 'var(--navbar-height)' }}>
        {/* Hero Banner with blurred cover */}
        <div style={{ position: 'relative', height: 280, overflow: 'hidden' }}>
          {coverUrl && (
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: `url(${coverUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center 20%',
              filter: 'blur(30px) brightness(0.2) saturate(1.5)',
              transform: 'scale(1.1)',
            }} />
          )}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, rgba(9,9,15,0.3) 0%, var(--bg-base) 100%)',
          }} />
        </div>

        <div className="container" style={{ position: 'relative', marginTop: -200, paddingBottom: '64px' }}>
          {/* Main Info Card */}
          <div className="detail-header-flex" style={{
            display: 'flex',
            gap: '32px',
            marginBottom: '40px',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
          }}>
            {/* Poster Cover */}
            <div style={{ flexShrink: 0 }}>
              <img
                src={coverUrl || ''}
                alt={title}
                style={{
                  width: 180,
                  height: 260,
                  objectFit: 'cover',
                  borderRadius: 'var(--radius-xl)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)',
                }}
              />
            </div>

            {/* Title / Description */}
            <div className="detail-header-info" style={{ flex: 1, minWidth: '280px', paddingTop: '80px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
                <Link to="/" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>›</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Anime</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>›</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-accent)' }}>{title}</span>
              </div>

              <h1 style={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 800,
                fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
                color: 'var(--text-primary)',
                lineHeight: 1.2,
                marginBottom: '8px',
              }}>
                {title}
              </h1>

              {studio && (
                <p style={{ color: 'var(--text-accent)', fontWeight: 500, marginBottom: '16px', fontSize: '0.9rem' }}>
                  by {studio}
                </p>
              )}

              {/* Stats row */}
              <div className="stats-row" style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {rating && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#fbbf24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    <span style={{ fontWeight: 700, fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}>
                      {rating}
                    </span>
                  </div>
                )}
                {type && (
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>📺 {type}</span>
                )}
                {totalEpisodes > 0 && (
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>🎞️ {totalEpisodes} Episode</span>
                )}
                {year && (
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>📅 {year}</span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="actions-row" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
                {totalEpisodes > 0 && (
                  <Link
                    to={`/watch/${id}/episode/1`}
                    className="btn-primary"
                    style={{ textDecoration: 'none' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                    </svg>
                    Tonton Episode 1
                  </Link>
                )}
                <button
                  onClick={toggleFavorite}
                  className="btn-secondary"
                  style={{ color: fav ? '#ef4444' : 'var(--text-primary)' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={fav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  {fav ? 'Favorit Saya' : 'Favoritkan'}
                </button>
                <button
                  onClick={toggleWatchlistHandler}
                  className="btn-secondary"
                  style={{ color: inWatchlist ? 'var(--text-accent)' : 'var(--text-primary)' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={inWatchlist ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                    <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                  </svg>
                  {inWatchlist ? 'Di Watchlist' : 'Watchlist'}
                </button>
              </div>
            </div>
          </div>

          {/* Details Sidebar / Synopsis Grid */}
          <div className="detail-two-columns" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 320px',
            gap: '40px',
            alignItems: 'flex-start',
          }}>
            {/* Left Column: Synopsis & Episodes */}
            <div style={{ minWidth: 0 }}>
              <section style={{ marginBottom: '40px' }}>
                <h3 className="section-title" style={{ marginBottom: '16px' }}>Sinopsis</h3>
                <p style={{
                  fontSize: '0.95rem',
                  lineHeight: '1.7',
                  color: 'var(--text-secondary)',
                  whiteSpace: 'pre-line',
                }}>
                  {anime.synopsis || 'Tidak ada sinopsis tersedia.'}
                </p>
              </section>

              {/* Episode List */}
              <section style={{ marginBottom: '40px' }}>
                <h3 className="section-title" style={{ marginBottom: '16px' }}>Daftar Episode</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {epLoading && displayEpisodes.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                      Memuat episode...
                    </div>
                  ) : displayEpisodes.length > 0 ? (
                    displayEpisodes.map(ep => {
                      const date = ep.aired ? new Date(ep.aired) : null;
                      const dateStr = date ? date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
                      return (
                        <EpisodeItem
                          key={ep.mal_id || ep.episode}
                          animeId={id}
                          episodeNum={ep.episode}
                          title={ep.title}
                          dateStr={dateStr}
                        />
                      );
                    })
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)' }}>
                      Daftar episode tidak tersedia untuk saat ini.
                    </div>
                  )}

                  {hasNext && !epLoading && (
                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                      <button onClick={loadMore} className="btn-secondary">
                        Muat Episode Berikutnya
                      </button>
                    </div>
                  )}
                </div>
              </section>

              {/* Streaming Platforms */}
              {streaming.length > 0 && (
                <section style={{ marginBottom: '40px' }}>
                  <h3 className="section-title" style={{ marginBottom: '16px' }}>Platform Resmi</h3>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {streaming.map(plat => (
                      <a
                        key={plat.name}
                        href={plat.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary"
                        style={{
                          fontSize: '0.85rem',
                          padding: '10px 20px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          border: '1px solid var(--border-accent)',
                          background: 'rgba(124,58,237,0.05)',
                        }}
                      >
                        🚀 Watch on {plat.name}
                      </a>
                    ))}
                  </div>
                </section>
              )}

              {/* Recommendations */}
              {recommendations.length > 0 && (
                <section style={{ marginTop: '56px' }}>
                  <h3 className="section-title" style={{ marginBottom: '20px' }}>Rekomendasi Terkait</h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                    gap: '16px',
                  }}>
                    {recommendations.map(rec => (
                      <AnimeCard key={rec.entry.mal_id} anime={rec.entry} />
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Right Column */}
            <div className="detail-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '320px', flexShrink: 0 }}>
              {/* Info details */}
              <div style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-xl)',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
              }}>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.1rem', marginBottom: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>Informasi</h3>
                
                {[
                  { label: 'Studio', value: studio },
                  { label: 'Status', value: status },
                  { label: 'Source', value: source },
                  { label: 'Durasi', value: duration },
                  { label: 'Rating', value: anime.rating },
                  { label: 'Popularitas', value: anime.popularity ? `#${anime.popularity}` : '' },
                  { label: 'Members', value: anime.members?.toLocaleString() },
                ].map(({ label, value }) => value ? (
                  <div key={label}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>{label}</span>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{value}</span>
                  </div>
                ) : null)}

                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', fontWeight: 600, marginBottom: '6px' }}>Genre</span>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {genres.map(genre => (
                      <span
                        key={genre.mal_id}
                        style={{
                          fontSize: '0.7rem',
                          padding: '3px 9px',
                          background: 'var(--bg-elevated)',
                          color: 'var(--text-secondary)',
                          borderRadius: '6px',
                          border: '1px solid var(--border-card)',
                        }}
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Subtitle Search Card */}
              <div style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-xl)',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
              }}>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.1rem', marginBottom: '4px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🇮🇩 Cari Subtitle Indonesia
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  Temukan subtitle atau streaming bahasa Indonesia untuk anime ini di platform eksternal:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(title + ' subtitle indonesia')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '10px',
                      fontSize: '0.8rem',
                      textAlign: 'center',
                      textDecoration: 'none',
                    }}
                  >
                    🔍 Google Search
                  </a>
                  <a
                    href={`https://otakudesu.cloud/?s=${encodeURIComponent(title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '10px',
                      fontSize: '0.8rem',
                      textAlign: 'center',
                      textDecoration: 'none',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      background: 'rgba(239, 68, 68, 0.05)',
                    }}
                  >
                    🐙 Otakudesu Search
                  </a>
                  <a
                    href={`https://samehadaku.care/?s=${encodeURIComponent(title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '10px',
                      fontSize: '0.8rem',
                      textAlign: 'center',
                      textDecoration: 'none',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      background: 'rgba(16, 185, 129, 0.05)',
                    }}
                  >
                    🐉 Samehadaku Search
                  </a>
                  <a
                    href={`https://kuramanime.run/?search=${encodeURIComponent(title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '10px',
                      fontSize: '0.8rem',
                      textAlign: 'center',
                      textDecoration: 'none',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      background: 'rgba(59, 130, 246, 0.05)',
                    }}
                  >
                    🐱 Kuramanime Search
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </>
  );
}
