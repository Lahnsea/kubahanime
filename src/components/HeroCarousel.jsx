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
    setTimeout(() => setAnimating(false), 700);
  }, [animating, current]);

  const goNext = useCallback(() => goTo((current + 1) % slides.length), [current, slides.length, goTo]);
  const goPrev = useCallback(() => goTo((current - 1 + slides.length) % slides.length), [current, slides.length, goTo]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(goNext, 7000);
    return () => clearInterval(timer);
  }, [goNext, slides.length]);

  if (!slides.length) {
    return (
      <div style={{ height: '580px', background: 'var(--bg-surface)', position: 'relative', overflow: 'hidden' }}>
        <div className="skeleton" style={{ width: '100%', height: '100%' }} />
      </div>
    );
  }

  const anime = slides[current];
  const title = extractTitle(anime);
  const coverUrl = extractCover(anime);
  const description = anime.synopsis || '';
  const genres = anime.genres?.slice(0, 3) ?? [];
  const animeId = anime.mal_id.toString();
  const score = anime.score;
  const year = anime.year || anime.aired?.prop?.from?.year;
  const totalEp = anime.episodes;

  return (
    <div className="hero-carousel" style={{ position: 'relative', width: '100%', height: '600px', overflow: 'hidden' }}>

      {/* Background — full bleed cover image */}
      {coverUrl && (
        <div
          key={`bg-${current}`}
          style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${coverUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 15%',
            transition: 'opacity 0.8s ease',
            opacity: animating ? 0 : 1,
          }}
        />
      )}

      {/* Multi-layer Netflix-style dark gradient overlays */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to right, rgba(10,10,12,0.97) 0%, rgba(10,10,12,0.88) 38%, rgba(10,10,12,0.45) 65%, rgba(10,10,12,0.08) 100%)',
      }} />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%',
        background: 'linear-gradient(to top, var(--bg-base) 0%, transparent 100%)',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 15% 55%, rgba(244,117,33,0.07) 0%, transparent 60%)',
      }} />

      {/* Content */}
      <div
        className="hero-carousel-content"
        style={{
          position: 'relative', zIndex: 10,
          height: '100%',
          display: 'flex', alignItems: 'center',
          padding: '0 80px',
          maxWidth: '1440px', margin: '0 auto',
          gap: '56px',
        }}
      >
        {/* Text */}
        <div
          className="hero-carousel-text"
          style={{
            flex: 1, maxWidth: '520px',
            animation: animating ? 'none' : 'slideInLeft 0.65s ease both',
          }}
        >
          {/* Genre + Status badges */}
          <div className="badge-container" style={{ display: 'flex', gap: '8px', marginBottom: '18px', flexWrap: 'wrap' }}>
            {anime.status && (
              <span className="badge badge-ongoing" style={{ fontSize: '0.65rem' }}>{anime.status}</span>
            )}
            {genres.map(g => (
              <span key={g.mal_id} style={{
                fontSize: '0.68rem', padding: '3px 12px', borderRadius: '99px',
                background: 'rgba(255,255,255,0.07)',
                color: 'var(--text-secondary)',
                border: '1px solid rgba(255,255,255,0.1)',
                fontWeight: 600,
              }}>{g.name}</span>
            ))}
          </div>

          {/* Title */}
          <h1 style={{
            fontFamily: 'Outfit, sans-serif', fontWeight: 900,
            fontSize: 'clamp(2rem, 4vw, 3.2rem)',
            color: '#ffffff',
            lineHeight: 1.08,
            marginBottom: '14px',
            textShadow: '0 4px 32px rgba(0,0,0,0.7)',
            letterSpacing: '-0.02em',
          }}>
            {title}
          </h1>

          {/* Meta info */}
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap' }}>
            {score && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="#f59e0b">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: '#f59e0b' }}>{score}</span>
              </div>
            )}
            {year && <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{year}</span>}
            {totalEp && <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{totalEp} Episodes</span>}
            {anime.type && (
              <span style={{
                fontSize: '0.7rem', padding: '2px 10px', borderRadius: '4px',
                background: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)',
                fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>{anime.type}</span>
            )}
          </div>

          {/* Description */}
          {description && (
            <p style={{
              fontSize: '0.9rem', color: 'rgba(200,200,210,0.85)',
              lineHeight: 1.7,
              display: '-webkit-box', WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical', overflow: 'hidden',
              marginBottom: '30px',
            }}>
              {description}
            </p>
          )}

          {/* CTA Buttons — Netflix + Crunchyroll style */}
          <div className="cta-container" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link to={`/watch/${animeId}/episode/1`} className="btn-play">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
              Tonton Sekarang
            </Link>
            <Link to={`/anime/${animeId}`} className="btn-secondary" style={{ padding: '13px 26px' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
              </svg>
              Info Lebih Lanjut
            </Link>
          </div>
        </div>

        {/* Floating cover poster */}
        <div
          className="hero-carousel-cover"
          style={{
            flexShrink: 0, width: '210px',
            animation: animating ? 'none' : 'fadeIn 0.7s ease both',
          }}
        >
          {coverUrl && (
            <img
              src={coverUrl}
              alt={title}
              style={{
                width: '210px', height: '300px',
                objectFit: 'cover',
                borderRadius: 'var(--radius-xl)',
                boxShadow: '0 28px 70px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.07), 0 0 40px rgba(244,117,33,0.12)',
              }}
            />
          )}
        </div>
      </div>

      {/* Progress dots */}
      <div style={{
        position: 'absolute', bottom: '32px', left: '80px',
        display: 'flex', gap: '8px', zIndex: 20,
      }}>
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            style={{
              width: i === current ? '28px' : '8px',
              height: '4px', borderRadius: '99px',
              background: i === current ? 'var(--accent-primary)' : 'rgba(255,255,255,0.22)',
              border: 'none', cursor: 'pointer',
              transition: 'all 0.35s ease',
              padding: 0,
            }}
          />
        ))}
      </div>

      {/* Arrow nav */}
      {[
        { onClick: goPrev, side: { left: '24px' }, icon: '‹' },
        { onClick: goNext, side: { right: '24px' }, icon: '›' },
      ].map((btn, i) => (
        <button
          key={i}
          onClick={btn.onClick}
          style={{
            position: 'absolute', top: '50%', transform: 'translateY(-50%)',
            ...btn.side, zIndex: 20,
            width: '48px', height: '48px', borderRadius: '50%',
            background: 'rgba(10,10,12,0.75)', backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'white', fontSize: '1.6rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'var(--transition)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--accent-primary)';
            e.currentTarget.style.borderColor = 'var(--accent-primary)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(10,10,12,0.75)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
          }}
        >
          {btn.icon}
        </button>
      ))}

      {/* Slide counter */}
      <div style={{
        position: 'absolute', top: '32px', right: '32px', zIndex: 20,
        fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)',
        fontFamily: 'Outfit, sans-serif', fontWeight: 700,
        letterSpacing: '0.1em',
      }}>
        {String(current + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
      </div>

      <style>{`@keyframes slideInLeft { from { opacity: 0; transform: translateX(-32px); } to { opacity: 1; transform: translateX(0); } }`}</style>
    </div>
  );
}
