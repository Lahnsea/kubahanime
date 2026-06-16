import { Link } from 'react-router-dom';
import { extractTitle, extractCover } from '../hooks/useAnime';

export default function AnimeCard({ anime, index = 0, badgeText = '' }) {
  if (!anime) return null;

  const animeId = (anime.mal_id || anime.id).toString();
  const title = extractTitle(anime);
  const coverUrl = extractCover(anime);
  const type = anime.type || 'TV';
  const episodes = anime.episodes || anime.lastEpisodeNum || '?';
  const score = anime.score || '';

  const typeBadgeClass = type === 'Movie' ? 'badge-movie' : 'badge-ongoing';

  return (
    <Link
      to={`/anime/${animeId}`}
      className="anime-card-link"
      style={{
        display: 'block',
        textDecoration: 'none',
        position: 'relative',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-card)',
        transition: 'all 0.32s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        animation: `fadeIn 0.4s ease ${index * 0.045}s both`,
        flexShrink: 0,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-8px) scale(1.03)';
        e.currentTarget.style.borderColor = 'rgba(244,117,33,0.55)';
        e.currentTarget.style.boxShadow = '0 0 0 2px rgba(244,117,33,0.2), 0 20px 50px rgba(0,0,0,0.85), 0 0 30px rgba(244,117,33,0.15)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.borderColor = 'var(--border-card)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Cover Image */}
      <div style={{ position: 'relative', aspectRatio: '2/3', overflow: 'hidden' }}>
        {coverUrl ? (
          <img
            className="anime-card-img"
            src={coverUrl}
            alt={title}
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.45s ease', display: 'block' }}
            onMouseEnter={e => e.target.style.transform = 'scale(1.1)'}
            onMouseLeave={e => e.target.style.transform = 'scale(1)'}
            onError={e => { e.target.parentNode.style.background = 'var(--bg-elevated)'; e.target.style.display = 'none'; }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%', background: 'var(--bg-elevated)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '2rem',
          }}>🎬</div>
        )}

        {/* Deep gradient overlay */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '65%',
          background: 'linear-gradient(to top, rgba(10,10,12,0.97) 0%, rgba(10,10,12,0.5) 50%, transparent 100%)',
        }} />

        {/* Score */}
        {score && (
          <div style={{
            position: 'absolute', top: 8, left: 8,
            background: 'rgba(10,10,12,0.82)', backdropFilter: 'blur(6px)',
            padding: '3px 8px', borderRadius: '6px',
            display: 'flex', alignItems: 'center', gap: '4px',
            border: '1px solid rgba(245,158,11,0.25)',
          }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#f59e0b">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: '#f59e0b' }}>
              {Number(score).toFixed(1)}
            </span>
          </div>
        )}

        {/* Type badge */}
        <div style={{ position: 'absolute', top: 8, right: 8 }}>
          <span className={`badge ${typeBadgeClass}`} style={{ fontSize: '0.6rem' }}>{type}</span>
        </div>

        {/* Broadcast time badge */}
        {badgeText && (
          <div style={{
            position: 'absolute', bottom: 6, left: 6, right: 6,
            background: 'rgba(10,10,12,0.88)', backdropFilter: 'blur(6px)',
            padding: '4px 8px', borderRadius: '6px',
            border: '1px solid rgba(244,117,33,0.2)',
            fontSize: '0.65rem', color: 'var(--accent-primary)',
            fontWeight: 700, textAlign: 'center', zIndex: 2,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
          }}>
            🕒 {badgeText}
          </div>
        )}

        {/* Play icon on hover */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: 0, transition: 'opacity 0.3s ease',
          background: 'rgba(10,10,12,0.35)',
        }}
          onMouseEnter={e => e.currentTarget.style.opacity = '1'}
          onMouseLeave={e => e.currentTarget.style.opacity = '0'}
        >
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            background: 'var(--accent-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 24px rgba(244,117,33,0.6)',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '10px 12px 12px' }}>
        <h3 style={{
          fontFamily: 'Outfit, sans-serif', fontWeight: 700,
          fontSize: '0.875rem', color: 'var(--text-primary)',
          lineHeight: 1.3, marginBottom: '5px',
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>{title}</h3>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
          <span>{episodes === '?' ? 'Ongoing' : `${episodes} Ep`}</span>
          {anime.season && (
            <span style={{ textTransform: 'capitalize' }}>{anime.season} {anime.year}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

/** Wide row variant — Top Ranking Sidebar */
export function AnimeCardWide({ anime, index = 0 }) {
  if (!anime) return null;
  const animeId = (anime.mal_id || anime.id).toString();
  const title = extractTitle(anime);
  const coverUrl = extractCover(anime);
  const type = anime.type || 'TV';
  const score = anime.score || '';

  return (
    <Link
      to={`/anime/${animeId}`}
      style={{
        display: 'flex', gap: '12px', padding: '12px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--bg-card)', border: '1px solid var(--border-card)',
        textDecoration: 'none', transition: 'all 0.25s ease',
        animation: `fadeIn 0.4s ease ${index * 0.07}s both`,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'var(--bg-elevated)';
        e.currentTarget.style.borderColor = 'var(--border-accent)';
        e.currentTarget.style.transform = 'translateX(5px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'var(--bg-card)';
        e.currentTarget.style.borderColor = 'var(--border-card)';
        e.currentTarget.style.transform = 'translateX(0)';
      }}
    >
      <img
        src={coverUrl || ''}
        alt={title}
        loading="lazy"
        style={{ width: 48, height: 66, objectFit: 'cover', borderRadius: '7px', flexShrink: 0 }}
        onError={e => { e.target.style.background = 'var(--bg-elevated)'; e.target.src = ''; }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <h4 style={{
          fontFamily: 'Outfit, sans-serif', fontWeight: 600,
          fontSize: '0.85rem', color: 'var(--text-primary)',
          marginBottom: '4px', whiteSpace: 'nowrap',
          overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{title}</h4>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '5px' }}>
          <span style={{ textTransform: 'uppercase', fontWeight: 600 }}>{type}</span>
          {anime.episodes && <span> · {anime.episodes} Ep</span>}
        </div>
        {score && (
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#f59e0b">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <span style={{ fontSize: '0.73rem', fontWeight: 700, color: '#f59e0b' }}>{Number(score).toFixed(2)}</span>
          </div>
        )}
      </div>
    </Link>
  );
}

/** Skeleton Loader */
export function AnimeCardSkeleton() {
  return (
    <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
      <div className="skeleton" style={{ aspectRatio: '2/3', width: '100%' }} />
      <div style={{ padding: '10px 12px 12px' }}>
        <div className="skeleton" style={{ height: 13, width: '82%', marginBottom: 7 }} />
        <div className="skeleton" style={{ height: 11, width: '55%' }} />
      </div>
    </div>
  );
}
