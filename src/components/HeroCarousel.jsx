import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { extractTitle, extractCover } from '../hooks/useAnime';

export default function HeroCarousel({ animes = [] }) {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  const slides = animes.slice(0, 6);

  const goTo = useCallback((idx) => {
    if (animating || idx === current) return;
    setAnimating(true);
    setCurrent(idx);
    setTimeout(() => setAnimating(false), 600);
  }, [animating, current]);

  const goNext = useCallback(() => {
    goTo((current + 1) % slides.length);
  }, [current, slides.length, goTo]);

  const goPrev = useCallback(() => {
    goTo((current - 1 + slides.length) % slides.length);
  }, [current, slides.length, goTo]);

  // Auto-play
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(goNext, 6000);
    return () => clearInterval(timer);
  }, [goNext, slides.length]);

  if (!slides.length) {
    return (
      <div style={{
        height: '520px',
        background: 'var(--bg-surface)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div className="skeleton" style={{ width: '100%', height: '100%' }} />
      </div>
    );
  }

  const anime = slides[current];
  const title = extractTitle(anime);
  const coverUrl = extractCover(anime);
  const description = anime.synopsis || 'Tidak ada sinopsis tersedia.';
  const genres = anime.genres?.slice(0, 3) ?? [];
  const status = anime.status;
  const animeId = anime.mal_id.toString();

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '540px',
      overflow: 'hidden',
    }}>
      {/* Background blur cover */}
      {coverUrl && (
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${coverUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          filter: 'blur(40px) brightness(0.25) saturate(1.5)',
          transform: 'scale(1.1)',
          transition: 'background-image 0.8s ease',
        }} />
      )}

      {/* Gradient overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to right, rgba(9,9,15,0.96) 45%, rgba(9,9,15,0.5) 75%, rgba(9,9,15,0.2) 100%)',
      }} />
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '200px',
        background: 'linear-gradient(to top, var(--bg-base) 0%, transparent 100%)',
      }} />

      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        padding: '0 80px',
        maxWidth: '1400px',
        margin: '0 auto',
        gap: '48px',
      }}>
        {/* Text Content */}
        <div style={{
          flex: 1,
          maxWidth: '500px',
          animation: animating ? 'none' : 'slide-in 0.6s ease both',
        }}>
          {/* Tags */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <span className="badge badge-ongoing" style={{ textTransform: 'capitalize' }}>{status}</span>
            {genres.map(g => (
              <span
                key={g.mal_id}
                style={{
                  fontSize: '0.7rem',
                  padding: '3px 10px',
                  borderRadius: '99px',
                  background: 'rgba(255,255,255,0.08)',
                  color: 'var(--text-secondary)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                {g.name}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 800,
            fontSize: 'clamp(1.8rem, 3vw, 2.8rem)',
            color: 'var(--text-primary)',
            lineHeight: 1.15,
            marginBottom: '12px',
            textShadow: '0 2px 20px rgba(0,0,0,0.5)',
          }}>
            {title}
          </h1>

          {/* Score */}
          {anime.score && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.9rem',
              color: 'var(--text-accent)',
              marginBottom: '14px',
              fontWeight: 600,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#fbbf24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span>Score: {anime.score}</span>
              {anime.rating && (
                <>
                  <span style={{ opacity: 0.5 }}>•</span>
                  <span>{anime.rating}</span>
                </>
              )}
            </div>
          )}

          {/* Description */}
          <p style={{
            fontSize: '0.9rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.65,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            marginBottom: '28px',
          }}>
            {description}
          </p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link to={`/anime/${animeId}`} className="btn-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
              </svg>
              Tonton Sekarang
            </Link>
            <Link to={`/anime/${animeId}`} className="btn-secondary">
              Detail
            </Link>
          </div>
        </div>

        {/* Cover Image */}
        <div style={{
          flexShrink: 0,
          width: '200px',
          animation: animating ? 'none' : 'fadeIn 0.6s ease both',
        }}>
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={title}
              style={{
                width: '200px',
                height: '280px',
                objectFit: 'cover',
                borderRadius: 'var(--radius-xl)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.08)',
              }}
            />
          ) : null}
        </div>
      </div>

      {/* Navigation Dots */}
      <div style={{
        position: 'absolute',
        bottom: '28px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '8px',
        zIndex: 20,
      }}>
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            style={{
              width: i === current ? '24px' : '8px',
              height: '8px',
              borderRadius: '99px',
              background: i === current ? 'var(--accent-primary)' : 'rgba(255,255,255,0.25)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </div>

      {/* Arrow Buttons */}
      {[
        { onClick: goPrev, style: { left: '24px' }, icon: '‹' },
        { onClick: goNext, style: { right: '24px' }, icon: '›' },
      ].map((btn, i) => (
        <button
          key={i}
          onClick={btn.onClick}
          style={{
            position: 'absolute',
            top: '50%',
            transform: 'translateY(-50%)',
            ...btn.style,
            zIndex: 20,
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: 'rgba(17,17,24,0.8)',
            border: '1px solid var(--border-card)',
            color: 'var(--text-primary)',
            fontSize: '1.5rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(8px)',
            transition: 'var(--transition)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--accent-primary)';
            e.currentTarget.style.borderColor = 'var(--accent-primary)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(17,17,24,0.8)';
            e.currentTarget.style.borderColor = 'var(--border-card)';
          }}
        >
          {btn.icon}
        </button>
      ))}

      {/* Slide Counter */}
      <div style={{
        position: 'absolute',
        top: '28px',
        right: '28px',
        zIndex: 20,
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
        fontFamily: 'Outfit, sans-serif',
      }}>
        {String(current + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
      </div>
    </div>
  );
}
