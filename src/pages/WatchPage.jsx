import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAnimeDetail, useAnimeEpisodes, extractTitle } from '../hooks/useAnime';
import { useAuth } from '../contexts/AuthContext';
import { useHistory } from '../hooks/useUserData';
import { useLang } from '../contexts/LanguageContext';
import { getWatchEmbedUrl } from '../utils/animeApi';
import Navbar from '../components/Navbar';

export default function WatchPage() {
  const { id: animeId, episodeNum } = useParams();
  const navigate = useNavigate();

  const { anime, streaming, anilistId, loading: detailLoading } = useAnimeDetail(animeId);
  const { episodes, loading: epLoading } = useAnimeEpisodes(animeId);
  const { isLoggedIn } = useAuth();
  const { saveHistory } = useHistory();
  const { lang, setLanguage } = useLang();

  const epNumInt = parseInt(episodeNum, 10);
  const currentEpisode = episodes.find(ep => ep.episode === epNumInt);

  // Total episodes count
  const totalEpisodes = anime?.episodes || episodes.length || 0;

  // Dynamic list of episodes for navigation sidebar
  let displayEpisodes = episodes;
  if (!epLoading && episodes.length === 0 && totalEpisodes > 0) {
    displayEpisodes = Array.from({ length: totalEpisodes }).map((_, i) => ({
      mal_id: i + 1,
      episode: i + 1,
      title: `Episode ${i + 1}`,
    }));
  }

  // Auto-save history when anime detail and current episode are loaded
  useEffect(() => {
    if (!isLoggedIn || !anime || detailLoading) return;
    saveHistory(anime, epNumInt, currentEpisode?.title || `Episode ${epNumInt}`);
  }, [isLoggedIn, anime, epNumInt, currentEpisode, detailLoading, saveHistory]);

  const changeEpisode = (num) => {
    navigate(`/watch/${animeId}/episode/${num}`);
    window.scrollTo(0, 0);
  };

  const hasPrev = epNumInt > 1;
  const hasNext = epNumInt < totalEpisodes;
  const title = anime ? extractTitle(anime) : 'Memuat...';

  // ─── Render Video Player ──────────────────────────────────────────────────────
  const renderPlayer = () => {
    if (detailLoading) {
      return (
        <div style={{ aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#09090f', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ width: 40, height: 40, border: '3px solid var(--border-card)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        </div>
      );
    }

    if (anilistId) {
      const serverType = lang === 'id' ? 'sub' : 'dub';
      const iframeSrc = getWatchEmbedUrl(anilistId, epNumInt, serverType);
      return (
        <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#000', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-card)' }}>
          <iframe
            src={iframeSrc}
            width="100%"
            height="100%"
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title={`Watch ${title} Episode ${epNumInt}`}
          />
        </div>
      );
    }

    // Fallback to YouTube Trailer embed
    if (anime?.trailer?.embed_url) {
      return (
        <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#000', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-card)' }}>
          <iframe
            src={`${anime.trailer.embed_url}&autoplay=0`}
            width="100%"
            height="100%"
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title="Anime Trailer"
          />
          <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12, background: 'rgba(9,9,15,0.9)', backdropFilter: 'blur(8px)', padding: '12px 18px', borderRadius: '10px', border: '1px solid var(--border-card)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              ⚠️ Iframe player link tidak tersedia untuk anime ini, menampilkan trailer resmi.
            </span>
            {streaming.length > 0 && (
              <a href={streaming[0].url} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                Tonton di {streaming[0].name}
              </a>
            )}
          </div>
        </div>
      );
    }

    return (
      <div style={{ aspectRatio: '16/9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-card)', padding: '24px', textAlign: 'center' }}>
        <span style={{ fontSize: '2.5rem' }}>📺</span>
        <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Video player tidak tersedia</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '400px' }}>
          Maaf, link video stream tidak dapat dimuat untuk anime ini.
        </p>
        {streaming.length > 0 && (
          <a href={streaming[0].url} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ marginTop: '8px' }}>
            Nonton Resmi di {streaming[0].name}
          </a>
        )}
      </div>
    );
  };

  return (
    <>
      <Navbar />
      <div style={{ paddingTop: 'var(--navbar-height)', minHeight: '100vh', paddingBottom: '64px' }}>
        <div className="container" style={{ paddingTop: '28px' }}>

          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <Link to={`/anime/${animeId}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              Kembali ke Detail Anime
            </Link>
          </div>

          {/* Two-Column Layout */}
          <div className="watch-two-columns" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'flex-start' }}>

            {/* Main Column: Player & Info */}
            <div>
              {renderPlayer()}

              {/* Title Block */}
              <div style={{ marginTop: '20px', marginBottom: '24px' }}>
                <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.4rem', color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: '6px' }}>
                  {title} — Episode {episodeNum}
                </h1>
                {currentEpisode?.title && (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
                    Judul: {currentEpisode.title}
                  </p>
                )}

                {/* Sub/Dub Switcher */}
                {anilistId && (
                  <div style={{ display: 'inline-flex', background: 'var(--bg-surface)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-card)', marginBottom: '20px' }}>
                    <button
                      onClick={() => setLanguage('id')}
                      style={{ padding: '6px 16px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, background: lang === 'id' ? 'var(--accent-primary)' : 'none', color: lang === 'id' ? 'white' : 'var(--text-secondary)', cursor: 'pointer', border: 'none', transition: 'var(--transition)' }}
                    >
                      📝 Subbed (Server 1)
                    </button>
                    <button
                      onClick={() => setLanguage('en')}
                      style={{ padding: '6px 16px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, background: lang === 'en' ? 'var(--accent-primary)' : 'none', color: lang === 'en' ? 'white' : 'var(--text-secondary)', cursor: 'pointer', border: 'none', transition: 'var(--transition)' }}
                    >
                      🗣️ Dubbed (Server 2)
                    </button>
                  </div>
                )}

                {/* Navigation Toolbar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 20px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)', alignItems: 'center' }}>
                  <button
                    disabled={!hasPrev}
                    onClick={() => changeEpisode(epNumInt - 1)}
                    className="btn-secondary watch-nav-btn"
                    style={{ opacity: hasPrev ? 1 : 0.5, cursor: hasPrev ? 'pointer' : 'not-allowed', padding: '8px 16px', fontSize: '0.8rem' }}
                  >
                    <span>◀</span> <span className="btn-text">Sebelumnya</span>
                  </button>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>
                    Ep {episodeNum} / {totalEpisodes || '?'}
                  </span>
                  <button
                    disabled={!hasNext}
                    onClick={() => changeEpisode(epNumInt + 1)}
                    className="btn-primary watch-nav-btn"
                    style={{ opacity: hasNext ? 1 : 0.5, cursor: hasNext ? 'pointer' : 'not-allowed', padding: '8px 16px', fontSize: '0.8rem' }}
                  >
                    <span className="btn-text">Berikutnya</span> <span>▶</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="watch-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '340px', flexShrink: 0 }}>
              {/* Episode Sidebar */}
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-xl)', padding: '20px', maxHeight: 'calc(100vh - var(--navbar-height) - 180px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1rem', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid var(--border-subtle)' }}>
                  Daftar Episode ({totalEpisodes || '?'})
                </h3>

                <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', paddingRight: '4px' }}>
                  {epLoading && displayEpisodes.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                      Memuat...
                    </div>
                  ) : displayEpisodes.map(ep => {
                    const isCurrent = ep.episode === epNumInt;
                    return (
                      <button
                        key={ep.mal_id || ep.episode}
                        onClick={() => changeEpisode(ep.episode)}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '1px solid',
                          borderColor: isCurrent ? 'var(--border-accent)' : 'transparent',
                          background: isCurrent ? 'var(--bg-elevated)' : 'none',
                          color: isCurrent ? 'var(--text-accent)' : 'var(--text-secondary)',
                          fontFamily: 'inherit',
                          fontSize: '0.8rem',
                          fontWeight: isCurrent ? 700 : 500,
                          textAlign: 'left',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          transition: 'var(--transition)',
                        }}
                        onMouseEnter={e => {
                          if (!isCurrent) {
                            e.currentTarget.style.background = 'var(--bg-elevated)';
                            e.currentTarget.style.color = 'var(--text-primary)';
                          }
                        }}
                        onMouseLeave={e => {
                          if (!isCurrent) {
                            e.currentTarget.style.background = 'none';
                            e.currentTarget.style.color = 'var(--text-secondary)';
                          }
                        }}
                      >
                        <span style={{ width: 22, height: 22, borderRadius: '5px', background: isCurrent ? 'var(--gradient-accent)' : 'var(--bg-elevated)', color: isCurrent ? 'white' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
                          {ep.episode}
                        </span>
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {ep.title || `Episode ${ep.episode}`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Subtitle Search Widget */}
              <div style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-xl)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.95rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🇮🇩 Cari Subtitle Indonesia
                </h3>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  Link alternatif subtitle / streaming Indonesia:
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(title + ' subtitle indonesia')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '8px',
                      fontSize: '0.75rem',
                      textDecoration: 'none',
                    }}
                  >
                    🔍 Google
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
                      gap: '6px',
                      padding: '8px',
                      fontSize: '0.75rem',
                      textDecoration: 'none',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      background: 'rgba(239, 68, 68, 0.05)',
                    }}
                  >
                    🐙 Otakudesu
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
                      gap: '6px',
                      padding: '8px',
                      fontSize: '0.75rem',
                      textDecoration: 'none',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      background: 'rgba(16, 185, 129, 0.05)',
                    }}
                  >
                    🐉 Samehadaku
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
                      gap: '6px',
                      padding: '8px',
                      fontSize: '0.75rem',
                      textDecoration: 'none',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      background: 'rgba(59, 130, 246, 0.05)',
                    }}
                  >
                    🐱 Kuramanime
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
