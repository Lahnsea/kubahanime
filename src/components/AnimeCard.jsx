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

  return (
    <Link
      to={`/anime/${animeId}`}
      className="anime-card"
      style={{
        display: 'block',
        textDecoration: 'none',
        position: 'relative',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-card)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        animation: `fadeIn 0.4s ease ${index * 0.05}s both`,
        flexShrink: 0,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
        e.currentTarget.style.boxShadow = 'var(--shadow-hover)';
        e.currentTarget.style.borderColor = 'var(--border-accent)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = 'var(--border-card)';
      }}
    >
      {/* Cover Image */}
      <div style={{ position: 'relative', aspectRatio: '2/3', overflow: 'hidden' }}>
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={title}
            loading="lazy"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.4s ease',
            }}
            onMouseEnter={e => e.target.style.transform = 'scale(1.08)'}
            onMouseLeave={e => e.target.style.transform = 'scale(1)'}
            onError={e => {
              e.target.parentNode.style.background = 'var(--bg-elevated)';
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            background: 'var(--bg-elevated)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            fontSize: '2rem',
          }}>
            🎬
          </div>
        )}

        {/* Gradient overlay */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '60%',
          background: 'linear-gradient(to top, rgba(9,9,15,0.95) 0%, transparent 100%)',
        }} />

        {/* Score Badge */}
        {score && (
          <div style={{
            position: 'absolute',
            top: 10,
            left: 10,
            background: 'rgba(9,9,15,0.8)',
            backdropFilter: 'blur(4px)',
            padding: '3px 8px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#fbbf24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              fontFamily: 'Outfit, sans-serif',
              color: 'var(--text-primary)',
            }}>
              {Number(score).toFixed(2)}
            </span>
          </div>
        )}

        {/* Format Badge (TV, Movie, etc) */}
        <div style={{ position: 'absolute', top: 10, right: 10 }}>
          <span className="badge badge-ongoing" style={{ textTransform: 'uppercase' }}>{type}</span>
        </div>

        {/* Time Broadcast Badge */}
        {badgeText && (
          <div style={{
            position: 'absolute',
            bottom: 8,
            left: 8,
            right: 8,
            background: 'rgba(9,9,15,0.85)',
            backdropFilter: 'blur(4px)',
            padding: '4px 8px',
            borderRadius: '6px',
            border: '1px solid rgba(255,255,255,0.08)',
            fontSize: '0.68rem',
            color: 'var(--text-accent)',
            fontWeight: 700,
            textAlign: 'center',
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
          }}>
            🕒 {badgeText}
          </div>
        )}
      </div>


      {/* Info */}
      <div style={{ padding: '12px' }}>
        <h3 style={{
          fontFamily: 'Outfit, sans-serif',
          fontWeight: 700,
          fontSize: '0.9rem',
          color: 'var(--text-primary)',
          lineHeight: 1.3,
          marginBottom: '6px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {title}
        </h3>

        {/* Episodes and Info */}
        <div style={{
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          display: 'flex',
          justifyContent: 'space-between',
        }}>
          <span>{episodes === '?' ? 'Ongoing' : `${episodes} Episode`}</span>
          {anime.season && (
            <span style={{ textTransform: 'capitalize' }}>
              {anime.season} {anime.year}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

/**
 * Wide row variant for Rank List / Top Popular Anime
 */
export function AnimeCardWide({ anime, index = 0 }) {
  if (!anime) return null;

  const animeId = (anime.mal_id || anime.id).toString();
  const title = extractTitle(anime);
  const coverUrl = extractCover(anime);
  const type = anime.type || 'TV';
  const episodes = anime.episodes || anime.lastEpisodeNum || '?';
  const score = anime.score || '';

  return (
    <Link
      to={`/anime/${animeId}`}
      style={{
        display: 'flex',
        gap: '14px',
        padding: '14px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-card)',
        textDecoration: 'none',
        transition: 'all 0.25s ease',
        animation: `fadeIn 0.4s ease ${index * 0.08}s both`,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'var(--bg-elevated)';
        e.currentTarget.style.borderColor = 'var(--border-accent)';
        e.currentTarget.style.transform = 'translateX(4px)';
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
        style={{
          width: 52, height: 72,
          objectFit: 'cover',
          borderRadius: '8px',
          flexShrink: 0,
        }}
        onError={e => {
          e.target.style.background = 'var(--bg-elevated)';
          e.target.src = '';
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <h4 style={{
          fontFamily: 'Outfit, sans-serif',
          fontWeight: 600,
          fontSize: '0.875rem',
          color: 'var(--text-primary)',
          marginBottom: '4px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {title}
        </h4>
        <div style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          marginBottom: '6px',
        }}>
          <span style={{ textTransform: 'uppercase' }}>{type}</span>
          <span>•</span>
          <span>{episodes === '?' ? 'Ongoing' : `${episodes} Ep`}</span>
        </div>
        {score && (
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#fbbf24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {Number(score).toFixed(2)}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

/**
 * Skeleton Loader for AnimeCard
 */
export function AnimeCardSkeleton() {
  return (
    <div style={{
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      background: 'var(--bg-card)',
      border: '1px solid var(--border-card)',
    }}>
      <div className="skeleton" style={{ aspectRatio: '2/3', width: '100%' }} />
      <div style={{ padding: '12px' }}>
        <div className="skeleton" style={{ height: 14, width: '80%', marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 12, width: '60%' }} />
      </div>
    </div>
  );
}
