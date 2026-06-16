import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import HeroCarousel from '../components/HeroCarousel';
import AnimeCard, { AnimeCardSkeleton, AnimeCardWide } from '../components/AnimeCard';
import { usePopularAnime, useSeasonalAnime, useAnimeSchedule } from '../hooks/useAnime';

const DAYS = [
  { key: 'monday',    label: 'Sen' },
  { key: 'tuesday',  label: 'Sel' },
  { key: 'wednesday',label: 'Rab' },
  { key: 'thursday', label: 'Kam' },
  { key: 'friday',   label: 'Jum' },
  { key: 'saturday', label: 'Sab' },
  { key: 'sunday',   label: 'Min' },
];
const dayNamesMap = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
const todayKey = dayNamesMap[new Date().getDay()];

/* ── Netflix-style shelf header with scroll buttons ───────────────────── */
function ShelfHeader({ title, to, onScrollLeft, onScrollRight }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <h2 className="section-title">{title}</h2>
        {to && (
          <Link to={to} style={{
            fontSize: '0.78rem', color: 'var(--accent-primary)', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: '4px',
            border: '1px solid rgba(244,117,33,0.3)', padding: '4px 12px',
            borderRadius: '99px', transition: 'var(--transition)',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(244,117,33,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            Lihat Semua
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </Link>
        )}
      </div>
      {(onScrollLeft || onScrollRight) && (
        <div style={{ display: 'flex', gap: '6px' }}>
          {[{ fn: onScrollLeft, icon: '‹' }, { fn: onScrollRight, icon: '›' }].map((b, i) => (
            <button key={i} onClick={b.fn} style={{
              width: 32, height: 32, borderRadius: '8px',
              background: 'var(--bg-elevated)', border: '1px solid var(--border-card)',
              color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.25rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'var(--transition)',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-primary)'; e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.color = 'white'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.borderColor = 'var(--border-card)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >{b.icon}</button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  const { data: popularAnime, loading: popularLoading }   = usePopularAnime(24, 0);
  const { data: seasonalAnime, loading: seasonalLoading } = useSeasonalAnime(24, 400);
  const { data: scheduleAnime, loading: scheduleLoading, day: selectedDay, setDay } = useAnimeSchedule(todayKey, 800);

  const popularRef  = useRef(null);
  const seasonalRef = useRef(null);
  const scheduleRef = useRef(null);

  const scroll = (ref, dir) => ref.current?.scrollBy({ left: dir * 320, behavior: 'smooth' });

  return (
    <div style={{ paddingTop: 'var(--navbar-height)' }}>
      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <HeroCarousel animes={seasonalLoading ? [] : seasonalAnime.slice(0, 6)} />

      {/* Netflix ambient gradient below hero */}
      <div style={{
        height: '80px', marginTop: '-80px', position: 'relative', zIndex: 1,
        background: 'linear-gradient(to bottom, transparent, var(--bg-base))',
        pointerEvents: 'none',
      }} />

      <div className="container" style={{ paddingTop: '12px', paddingBottom: '72px' }}>

        {/* ── Jadwal Tayang — FIRST (Crunchyroll-style) ────────────────────── */}
        <section style={{ marginBottom: '52px' }}>
          <div style={{ position: 'relative', borderRadius: 'var(--radius-2xl)', overflow: 'hidden' }}>
            {/* Blurred bg from first schedule anime */}
            {scheduleAnime[0] && (() => {
              const bg = scheduleAnime[0].images?.webp?.large_image_url || scheduleAnime[0].images?.jpg?.large_image_url || '';
              return bg ? (
                <div style={{
                  position: 'absolute', inset: 0,
                  backgroundImage: `url(${bg})`, backgroundSize: 'cover', backgroundPosition: 'center',
                  filter: 'blur(50px) brightness(0.14) saturate(2)',
                  transform: 'scale(1.1)', transition: 'background-image 0.6s ease',
                }} />
              ) : null;
            })()}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(135deg, rgba(10,10,12,0.7) 0%, rgba(10,10,12,0.88) 100%)',
            }} />

            <div style={{ position: 'relative', zIndex: 2, padding: '32px 28px 28px' }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '22px', flexWrap: 'wrap', gap: '14px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <h2 className="section-title">📅 Jadwal Tayang</h2>
                    {/* Scroll buttons — same as popular shelf */}
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {[{ dir: -1, icon: '‹' }, { dir: 1, icon: '›' }].map((b, i) => (
                        <button key={i} onClick={() => scroll(scheduleRef, b.dir)} style={{
                          width: 32, height: 32, borderRadius: '8px',
                          background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
                          color: 'white', cursor: 'pointer', fontSize: '1.25rem',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'var(--transition)',
                        }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-primary)'; e.currentTarget.style.borderColor = 'var(--accent-primary)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
                        >{b.icon}</button>
                      ))}
                    </div>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '14px' }}>Tayangan anime di TV Jepang minggu ini</p>
                </div>

                {/* Day selector — Crunchyroll pill tabs */}
                <div style={{
                  display: 'flex', gap: '4px', flexWrap: 'wrap',
                  background: 'rgba(10,10,12,0.65)', backdropFilter: 'blur(14px)',
                  padding: '5px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.07)',
                }}>
                  {DAYS.map(({ key, label }) => {
                    const isActive = selectedDay === key;
                    const isToday  = todayKey === key;
                    return (
                      <button key={key} onClick={() => setDay(key)} style={{
                        padding: '7px 14px', borderRadius: '8px', fontSize: '0.75rem',
                        fontWeight: 700, fontFamily: 'Outfit, sans-serif',
                        background: isActive ? 'var(--accent-primary)' : 'transparent',
                        color: isActive ? 'white' : isToday ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        cursor: 'pointer', border: 'none', transition: 'var(--transition)',
                        display: 'flex', alignItems: 'center', gap: '5px',
                      }}>
                        {label}
                        {isToday && (
                          <span style={{
                            width: 5, height: 5, borderRadius: '50%',
                            background: isActive ? 'rgba(255,255,255,0.8)' : 'var(--accent-primary)',
                            display: 'inline-block',
                          }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Schedule shelf */}
              <div ref={scheduleRef} className="shelf-track">
                {scheduleLoading
                  ? Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} style={{ width: 148, flexShrink: 0 }}><AnimeCardSkeleton /></div>
                  ))
                  : scheduleAnime.length > 0
                    ? scheduleAnime.slice(0, 14).map((anime, i) => (
                      <div key={`sched-${anime.mal_id}-${i}`} style={{ width: 148, flexShrink: 0 }}>
                        <AnimeCard anime={anime} index={i} badgeText={anime.broadcast?.time || ''} />
                      </div>
                    ))
                    : (
                      <div style={{
                        padding: '48px 24px', textAlign: 'center',
                        color: 'var(--text-muted)', width: '100%',
                      }}>
                        Tidak ada anime terjadwal hari ini.
                      </div>
                    )
                }
              </div>
            </div>
          </div>
        </section>

        {/* ── Popular Anime — Horizontal Shelf ─────────────────────────── */}
        <section style={{ marginBottom: '52px' }}>
          <ShelfHeader
            title="🔥 Anime Terpopuler"
            to="/popular"
            onScrollLeft={() => scroll(popularRef, -1)}
            onScrollRight={() => scroll(popularRef, 1)}
          />
          <div ref={popularRef} className="shelf-track">
            {popularLoading
              ? Array.from({ length: 10 }).map((_, i) => (
                <div key={i} style={{ width: 152, flexShrink: 0 }}><AnimeCardSkeleton /></div>
              ))
              : popularAnime.slice(0, 18).map((anime, i) => (
                <div key={`pop-${anime.mal_id}`} style={{ width: 152, flexShrink: 0 }}>
                  <AnimeCard anime={anime} index={i} />
                </div>
              ))
            }
          </div>
        </section>

        {/* ── Seasonal Now — Shelf + Top Ranking sidebar ────────────────── */}
        <div className="home-two-columns" style={{
          display: 'grid', gridTemplateColumns: '1fr 360px',
          gap: '44px', marginBottom: '52px', alignItems: 'start',
        }}>
          {/* Seasonal shelf */}
          <section style={{ minWidth: 0 }}>
            <ShelfHeader
              title="🌸 Season Ini (Ongoing)"
              onScrollLeft={() => scroll(seasonalRef, -1)}
              onScrollRight={() => scroll(seasonalRef, 1)}
            />
            <div ref={seasonalRef} className="shelf-track">
              {seasonalLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} style={{ width: 148, flexShrink: 0 }}><AnimeCardSkeleton /></div>
                ))
                : seasonalAnime.map((anime, i) => (
                  <div key={`s-${anime.mal_id}-${i}`} style={{ width: 148, flexShrink: 0 }}>
                    <AnimeCard anime={anime} index={i} />
                  </div>
                ))
              }
            </div>
          </section>

          {/* Top Ranking sidebar */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <h2 className="section-title">🏆 Top Ranking</h2>
              <Link to="/popular" style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                Semua →
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {popularLoading
                ? Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 82, borderRadius: 'var(--radius-md)' }} />
                ))
                : popularAnime.slice(0, 8).map((anime, i) => (
                  <div key={`top-${anime.mal_id}`} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {/* Rank number */}
                    <span style={{
                      fontFamily: 'Outfit, sans-serif', fontWeight: 900,
                      fontSize: i < 3 ? '1.3rem' : '0.95rem',
                      color: i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : i === 2 ? '#cd7c2f' : 'var(--text-muted)',
                      width: 22, textAlign: 'right', flexShrink: 0, lineHeight: 1,
                    }}>{i + 1}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <AnimeCardWide anime={anime} index={i} />
                    </div>
                  </div>
                ))
              }
            </div>
          </section>
        </div>

      </div>


      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '36px 28px',
        background: 'var(--bg-surface)',
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: 30, height: 30, borderRadius: '8px',
              background: 'var(--accent-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.85rem', fontWeight: 900, color: 'white', fontFamily: 'Outfit',
            }}>K</div>
            <span style={{
              fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.1rem',
              background: 'var(--gradient-accent)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>Kubahanime</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Powered by Jikan · MyAnimeList API · © 2026 Kubahanime
          </p>
          <div style={{ display: 'flex', gap: '18px' }}>
            {[{ to: '/', label: 'Home' }, { to: '/popular', label: 'Populer' }, { to: '/latest', label: 'Terbaru' }].map(({ to, label }) => (
              <Link key={to} to={to} style={{ fontSize: '0.8rem', color: 'var(--text-muted)', transition: 'var(--transition)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              >{label}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
