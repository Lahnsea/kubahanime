import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAnimeDetail, useAnimeEpisodes, extractTitle, extractCover } from '../hooks/useAnime';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites, useWatchlist } from '../hooks/useUserData';
import AuthModal from '../components/AuthModal';
import AnimeCard from '../components/AnimeCard';

/* ── AniList-style color by score ─────────────────────────────────────── */
function scoreColor(score) {
  if (!score) return 'var(--text-muted)';
  if (score >= 8)  return '#2dce89';
  if (score >= 7)  return '#f59e0b';
  if (score >= 5)  return '#f47521';
  return '#ef4444';
}

/* ── Episode list item ────────────────────────────────────────────────── */
function EpisodeItem({ animeId, episodeNum, title, dateStr }) {
  return (
    <Link
      to={`/watch/${animeId}/episode/${episodeNum}`}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', borderRadius: 'var(--radius-md)',
        background: 'var(--bg-elevated)', border: '1px solid var(--border-card)',
        textDecoration: 'none', transition: 'var(--transition)',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-accent)'; e.currentTarget.style.background = '#1a1a20'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-card)'; e.currentTarget.style.background = 'var(--bg-elevated)'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
        <div style={{
          width: 34, height: 34, borderRadius: '8px',
          background: 'var(--accent-primary)', color: 'white',
          fontFamily: 'Outfit', fontWeight: 800, fontSize: '0.85rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>{episodeNum}</div>
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 600,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{title || `Episode ${episodeNum}`}</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        {dateStr && <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{dateStr}</span>}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2">
          <path d="M8 5v14l11-7z"/>
        </svg>
      </div>
    </Link>
  );
}

/* ── Sidebar info row ─────────────────────────────────────────────────── */
function InfoRow({ label, value, color }) {
  if (!value) return null;
  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '3px' }}>{label}</div>
      <div style={{ fontSize: '0.875rem', color: color || 'var(--text-primary)', fontWeight: 500 }}>{value}</div>
    </div>
  );
}

const TABS = ['Overview', 'Episodes', 'Detail & Stats'];

export default function AnimeDetailPage() {
  const { id } = useParams();
  const { anime, streaming, recommendations, anilistId, loading, error } = useAnimeDetail(id);
  const { episodes, loading: epLoading, hasNext, loadMore } = useAnimeEpisodes(id);
  const { isLoggedIn } = useAuth();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();

  const [activeTab, setActiveTab] = useState('Overview');
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
    if (!isLoggedIn) { setAuthOpen(true); return; }
    if (fav) { await removeFavorite(id); setFav(false); }
    else { await addFavorite(anime); setFav(true); }
  };

  const toggleWatchlist = async () => {
    if (!isLoggedIn) { setAuthOpen(true); return; }
    if (inWatchlist) { await removeFromWatchlist(id); setInWatchlist(false); }
    else { await addToWatchlist(anime); setInWatchlist(true); }
  };

  /* Loading skeleton */
  if (loading) return (
    <div style={{ paddingTop: 'var(--navbar-height)' }}>
      <div className="skeleton" style={{ height: 340, width: '100%' }} />
      <div className="container" style={{ paddingTop: 24, paddingBottom: 64, display: 'grid', gridTemplateColumns: '1fr 280px', gap: 32 }}>
        <div>
          <div className="skeleton" style={{ height: 36, width: '60%', marginBottom: 14 }} />
          <div className="skeleton" style={{ height: 18, width: '40%', marginBottom: 24 }} />
          <div className="skeleton" style={{ height: 100 }} />
        </div>
        <div><div className="skeleton" style={{ height: 360, borderRadius: 'var(--radius-xl)' }} /></div>
      </div>
    </div>
  );

  if (error || !anime) return (
    <div style={{ paddingTop: 'var(--navbar-height)', textAlign: 'center', padding: '80px 24px' }}>
      <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>{error || 'Anime tidak ditemukan.'}</p>
      <Link to="/" className="btn-primary">Kembali ke Home</Link>
    </div>
  );

  const title      = extractTitle(anime);
  const coverUrl   = extractCover(anime);
  const totalEp    = anime.episodes || 0;
  const score      = anime.score;
  const year       = anime.year || anime.aired?.prop?.from?.year;
  const studio     = anime.studios?.[0]?.name || '';
  const genres     = anime.genres ?? [];

  let displayEpisodes = episodes;
  if (!epLoading && episodes.length === 0 && totalEp > 0) {
    displayEpisodes = Array.from({ length: totalEp }).map((_, i) => ({ mal_id: i+1, episode: i+1, title: `Episode ${i+1}` }));
  }

  return (
    <>
      <div style={{ paddingTop: 'var(--navbar-height)' }}>

        {/* ── AniList Full-bleed Banner ─────────────────────────────────── */}
        <div style={{ position: 'relative', height: '320px', overflow: 'hidden' }}>
          {coverUrl && (
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: `url(${coverUrl})`,
              backgroundSize: 'cover', backgroundPosition: 'center 20%',
              filter: 'blur(0px) brightness(0.35) saturate(1.4)',
              transform: 'scale(1.04)',
            }} />
          )}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, rgba(10,10,12,0.2) 0%, rgba(10,10,12,0.6) 50%, var(--bg-base) 100%)',
          }} />
        </div>

        <div className="container" style={{ position: 'relative', marginTop: '-180px', paddingBottom: '72px' }}>
          {/* ── Header: floating cover + info ──────────────────────────── */}
          <div className="detail-header-flex" style={{ display: 'flex', gap: '32px', marginBottom: '36px', alignItems: 'flex-end', flexWrap: 'wrap' }}>

            {/* Floating cover poster */}
            <div style={{ flexShrink: 0, position: 'relative' }}>
              <img
                src={coverUrl}
                alt={title}
                style={{
                  width: 185, height: 265,
                  objectFit: 'cover',
                  borderRadius: 'var(--radius-xl)',
                  boxShadow: '0 24px 64px rgba(0,0,0,0.85), 0 0 0 3px rgba(244,117,33,0.2)',
                  display: 'block',
                }}
              />
              {score && (
                <div style={{
                  position: 'absolute', bottom: -14, right: -10,
                  width: 52, height: 52, borderRadius: '50%',
                  background: scoreColor(score), color: 'white',
                  fontFamily: 'Outfit', fontWeight: 900, fontSize: '1rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
                  border: '3px solid var(--bg-base)',
                }}>
                  {score}
                </div>
              )}
            </div>

            {/* Title + meta + actions */}
            <div className="detail-header-info" style={{ flex: 1, minWidth: '280px', paddingBottom: '8px' }}>
              {/* Breadcrumb */}
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '10px' }}>
                <Link to="/" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Home</Link>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>›</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-accent)', fontWeight: 600 }}>{title}</span>
              </div>

              <h1 style={{
                fontFamily: 'Outfit', fontWeight: 900,
                fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
                color: 'var(--text-primary)', lineHeight: 1.15, marginBottom: '6px',
                letterSpacing: '-0.02em',
              }}>{title}</h1>

              {studio && (
                <p style={{ color: 'var(--accent-primary)', fontWeight: 600, marginBottom: '14px', fontSize: '0.9rem' }}>
                  by {studio}
                </p>
              )}

              {/* Stats row */}
              <div className="stats-row" style={{ display: 'flex', gap: '18px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                {score && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="#f59e0b">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    <span style={{ fontWeight: 800, fontFamily: 'Outfit', color: '#f59e0b', fontSize: '0.95rem' }}>{score}</span>
                  </div>
                )}
                {anime.type && <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>📺 {anime.type}</span>}
                {totalEp > 0 && <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>🎞️ {totalEp} Episode</span>}
                {year && <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>📅 {year}</span>}
                {anime.status && (
                  <span className={`badge ${anime.status === 'Currently Airing' ? 'badge-ongoing' : anime.status === 'Finished Airing' ? 'badge-completed' : 'badge-hiatus'}`}>
                    {anime.status}
                  </span>
                )}
              </div>

              {/* Action buttons */}
              <div className="actions-row" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {totalEp > 0 && (
                  <Link to={`/watch/${id}/episode/1`} className="btn-primary" style={{ textDecoration: 'none' }}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                    Tonton Episode 1
                  </Link>
                )}
                <button
                  onClick={toggleFavorite} className="btn-secondary"
                  style={{ color: fav ? '#ef4444' : 'var(--text-primary)', borderColor: fav ? 'rgba(239,68,68,0.4)' : 'var(--border-card)' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={fav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  {fav ? 'Difavoritkan' : 'Favoritkan'}
                </button>
                <button
                  onClick={toggleWatchlist} className="btn-secondary"
                  style={{ color: inWatchlist ? 'var(--accent-primary)' : 'var(--text-primary)', borderColor: inWatchlist ? 'var(--border-accent)' : 'var(--border-card)' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={inWatchlist ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                  </svg>
                  {inWatchlist ? 'Di Watchlist' : 'Watchlist'}
                </button>
              </div>
            </div>
          </div>

          {/* ── AniList Tab Navigation ─────────────────────────────────── */}
          <div className="tab-bar" style={{ marginBottom: '28px' }}>
            {TABS.map(tab => (
              <button key={tab} className={`tab-btn${activeTab === tab ? ' active' : ''}`} onClick={() => setActiveTab(tab)}>
                {tab}
              </button>
            ))}
          </div>

          {/* ── Main + Sidebar layout ─────────────────────────────────── */}
          <div className="detail-two-columns" style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '36px', alignItems: 'start' }}>

            {/* ── LEFT: Tab Content ─────────────────────────────────── */}
            <div style={{ minWidth: 0 }}>

              {/* OVERVIEW TAB */}
              {activeTab === 'Overview' && (
                <div style={{ animation: 'fadeIn 0.3s ease' }}>
                  {/* Synopsis */}
                  <section style={{ marginBottom: '36px' }}>
                    <h3 className="section-title" style={{ marginBottom: '14px' }}>Sinopsis</h3>
                    <p style={{ fontSize: '0.92rem', lineHeight: '1.8', color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>
                      {anime.synopsis || 'Tidak ada sinopsis tersedia.'}
                    </p>
                  </section>

                  {/* Genres */}
                  {genres.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '36px' }}>
                      {genres.map(g => (
                        <Link key={g.mal_id} to={`/genre?genre=${encodeURIComponent(g.name)}`} style={{
                          padding: '6px 16px', borderRadius: '99px',
                          background: 'var(--bg-elevated)', border: '1px solid var(--border-card)',
                          fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)',
                          transition: 'var(--transition)', textDecoration: 'none',
                        }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-accent)'; e.currentTarget.style.color = 'var(--accent-primary)'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-card)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                        >{g.name}</Link>
                      ))}
                    </div>
                  )}

                  {/* Streaming platforms */}
                  {streaming.length > 0 && (
                    <section style={{ marginBottom: '36px' }}>
                      <h3 className="section-title" style={{ marginBottom: '14px' }}>Platform Resmi</h3>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {streaming.map(p => (
                          <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer" className="btn-secondary"
                            style={{ fontSize: '0.82rem', textDecoration: 'none', padding: '9px 18px', borderColor: 'var(--border-accent)', background: 'rgba(244,117,33,0.06)' }}>
                            🚀 {p.name}
                          </a>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Recommendations */}
                  {recommendations.length > 0 && (
                    <section>
                      <h3 className="section-title" style={{ marginBottom: '16px' }}>Rekomendasi Terkait</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '14px' }}>
                        {recommendations.map(rec => <AnimeCard key={rec.entry.mal_id} anime={rec.entry} />)}
                      </div>
                    </section>
                  )}
                </div>
              )}

              {/* EPISODES TAB */}
              {activeTab === 'Episodes' && (
                <div style={{ animation: 'fadeIn 0.3s ease' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <h3 className="section-title">Daftar Episode</h3>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Total: {totalEp || displayEpisodes.length} Episode</span>
                  </div>
                  {epLoading && displayEpisodes.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Memuat episode...</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {displayEpisodes.map(ep => {
                        const date = ep.aired ? new Date(ep.aired) : null;
                        const dateStr = date ? date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
                        return <EpisodeItem key={ep.mal_id || ep.episode} animeId={id} episodeNum={ep.episode} title={ep.title} dateStr={dateStr} />;
                      })}
                      {hasNext && !epLoading && (
                        <div style={{ textAlign: 'center', marginTop: '16px' }}>
                          <button onClick={loadMore} className="btn-secondary">Muat Episode Berikutnya</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* STATS TAB */}
              {activeTab === 'Detail & Stats' && (
                <div style={{ animation: 'fadeIn 0.3s ease' }}>
                  <h3 className="section-title" style={{ marginBottom: '20px' }}>Statistik & Detail</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '14px', marginBottom: '28px' }}>
                    {[
                      { label: 'Score', value: score, color: score ? scoreColor(score) : undefined },
                      { label: 'Ranked', value: anime.rank ? `#${anime.rank}` : null },
                      { label: 'Popularity', value: anime.popularity ? `#${anime.popularity}` : null },
                      { label: 'Members', value: anime.members?.toLocaleString() },
                      { label: 'Favorites', value: anime.favorites?.toLocaleString() },
                      { label: 'Episodes', value: totalEp || '?' },
                      { label: 'Duration', value: anime.duration },
                      { label: 'Rating', value: anime.rating },
                    ].filter(s => s.value).map(({ label, value, color }) => (
                      <div key={label} className="stat-card">
                        <div className="stat-value" style={{ fontSize: '1.5rem', color: color || 'var(--accent-primary)' }}>{value}</div>
                        <div className="stat-label">{label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Score breakdown bar */}
                  {score && (
                    <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-lg)', padding: '20px', marginBottom: '20px' }}>
                      <div style={{ fontFamily: 'Outfit', fontWeight: 700, marginBottom: '14px', fontSize: '0.9rem' }}>Score Overview</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '10px' }}>
                        <div style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '3rem', color: scoreColor(score) }}>{score}</div>
                        <div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>dari 10.0</div>
                          <div className="progress-bar-track" style={{ width: '200px' }}>
                            <div className="progress-bar-fill" style={{ width: `${(score / 10) * 100}%`, background: scoreColor(score) }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* External links */}
                  {streaming.length > 0 && (
                    <div>
                      <h4 style={{ fontFamily: 'Outfit', fontWeight: 700, marginBottom: '12px', fontSize: '0.9rem' }}>Tonton di Platform Resmi</h4>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {streaming.map(p => (
                          <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer" className="btn-secondary"
                            style={{ fontSize: '0.8rem', textDecoration: 'none' }}>🚀 {p.name}</a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── RIGHT: AniList-style sidebar ────────────────────────── */}
            <div className="detail-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Info card */}
              <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-xl)', padding: '22px' }}>
                <h3 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1rem', marginBottom: '18px', paddingBottom: '10px', borderBottom: '1px solid var(--border-subtle)' }}>
                  Informasi
                </h3>
                <InfoRow label="Format" value={anime.type} />
                <InfoRow label="Episode" value={totalEp > 0 ? totalEp : null} />
                <InfoRow label="Status" value={anime.status} color={anime.status === 'Currently Airing' ? 'var(--accent-primary)' : undefined} />
                <InfoRow label="Season" value={anime.season && year ? `${anime.season.charAt(0).toUpperCase() + anime.season.slice(1)} ${year}` : null} />
                <InfoRow label="Studio" value={studio} />
                <InfoRow label="Source" value={anime.source} />
                <InfoRow label="Durasi" value={anime.duration} />
                <InfoRow label="Rating" value={anime.rating} />

                {genres.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px' }}>Genre</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {genres.map(g => (
                        <Link key={g.mal_id} to={`/genre?genre=${encodeURIComponent(g.name)}`} style={{
                          fontSize: '0.7rem', padding: '3px 10px', borderRadius: '99px',
                          background: 'rgba(244,117,33,0.1)', color: 'var(--accent-primary)',
                          border: '1px solid rgba(244,117,33,0.25)', textDecoration: 'none',
                          transition: 'var(--transition)',
                        }}>
                          {g.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Subtitle search card */}
              <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-xl)', padding: '22px' }}>
                <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '0.9rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🇮🇩 Cari Subtitle Indonesia
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                  {[
                    { href: `https://www.google.com/search?q=${encodeURIComponent(title + ' subtitle indonesia')}`, label: '🔍 Google', color: 'rgba(255,255,255,0.06)' },
                    { href: `https://otakudesu.cloud/?s=${encodeURIComponent(title)}`, label: '🐙 Otakudesu', color: 'rgba(239,68,68,0.06)', border: 'rgba(239,68,68,0.25)' },
                    { href: `https://samehadaku.care/?s=${encodeURIComponent(title)}`, label: '🐉 Samehadaku', color: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.25)' },
                    { href: `https://kuramanime.run/?search=${encodeURIComponent(title)}`, label: '🐱 Kuramanime', color: 'rgba(59,130,246,0.06)', border: 'rgba(59,130,246,0.25)' },
                  ].map(({ href, label, color, border }) => (
                    <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '9px', borderRadius: 'var(--radius-sm)',
                        background: color, border: `1px solid ${border || 'var(--border-card)'}`,
                        fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)',
                        textDecoration: 'none', transition: 'var(--transition)',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
                    >{label}</a>
                  ))}
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
