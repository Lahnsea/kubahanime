import { useRef } from 'react';
import { Link } from 'react-router-dom';
import HeroCarousel from '../components/HeroCarousel';
import AnimeCard, { AnimeCardSkeleton, AnimeCardWide } from '../components/AnimeCard';
import { usePopularAnime, useSeasonalAnime, useAnimeSchedule } from '../hooks/useAnime';

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Senin' },
  { key: 'tuesday', label: 'Selasa' },
  { key: 'wednesday', label: 'Rabu' },
  { key: 'thursday', label: 'Kamis' },
  { key: 'friday', label: 'Jumat' },
  { key: 'saturday', label: 'Sabtu' },
  { key: 'sunday', label: 'Minggu' }
];

const dayIndex = new Date().getDay();
const dayNamesMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const todayKey = dayNamesMap[dayIndex];


function SectionHeader({ title, to }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '20px',
    }}>
      <h2 className="section-title">{title}</h2>
      {to && (
        <Link
          to={to}
          style={{
            fontSize: '0.8rem',
            color: 'var(--text-accent)',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            transition: 'var(--transition)',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-accent)'}
        >
          Lihat Semua
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </Link>
      )}
    </div>
  );
}

export default function HomePage() {
  // Stagger the three hooks: popular fires immediately (0ms),
  // seasonal fires after 400ms, schedule fires after 800ms
  // so only 1 request is active at a time when cache is cold.
  const { data: popularAnime, loading: popularLoading } = usePopularAnime(18, 0);
  const { data: seasonalAnime, loading: seasonalLoading } = useSeasonalAnime(18, 400);
  const { data: scheduleAnime, loading: scheduleLoading, day: selectedDay, setDay: setSelectedDay } = useAnimeSchedule(todayKey, 800);
  const scrollRef = useRef(null);


  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 300, behavior: 'smooth' });
    }
  };

  return (
    <div style={{ paddingTop: 'var(--navbar-height)' }}>
      {/* Hero Carousel - Show seasonal ongoing anime */}
      <HeroCarousel animes={seasonalLoading ? [] : seasonalAnime.slice(0, 6)} />

      {/* Main Content */}
      <div className="container" style={{ paddingTop: '48px', paddingBottom: '64px' }}>

        {/* ===== Popular Anime Grid ===== */}
        <section style={{ marginBottom: '56px' }}>
          <SectionHeader title="Anime Terpopuler" to="/popular" />
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '16px',
          }}>
            {popularLoading
              ? Array.from({ length: 12 }).map((_, i) => <AnimeCardSkeleton key={i} />)
              : popularAnime.slice(0, 12).map((anime, i) => (
                <AnimeCard key={`pop-${anime.mal_id}-${i}`} anime={anime} index={i} />
              ))
            }
          </div>
        </section>

        {/* ===== Jadwal Tayang Anime ===== */}
        <section style={{ marginBottom: '56px', position: 'relative', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
          {/* Blurred anime background */}
          {scheduleAnime.length > 0 && scheduleAnime[0] && (() => {
            const bgImg = scheduleAnime[0].images?.webp?.large_image_url || scheduleAnime[0].images?.jpg?.large_image_url || '';
            return bgImg ? (
              <div style={{
                position: 'absolute', inset: 0, zIndex: 0,
                backgroundImage: `url(${bgImg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(40px) brightness(0.18) saturate(1.8)',
                transform: 'scale(1.1)',
                transition: 'background-image 0.5s ease',
              }} />
            ) : null;
          })()}
          {/* Dark overlay for readability */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 1,
            background: 'linear-gradient(180deg, rgba(9,9,15,0.55) 0%, rgba(9,9,15,0.82) 100%)',
          }} />

          {/* Content above bg */}
          <div style={{ position: 'relative', zIndex: 2, padding: '32px 0 28px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <h2 className="section-title" style={{ marginBottom: '4px' }}>Jadwal Tayang Hari Ini</h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Menampilkan anime yang ditayangkan di stasiun TV Jepang</p>
              </div>
              {/* Day Selector Tabs */}
              <div style={{
                display: 'flex',
                gap: '6px',
                flexWrap: 'wrap',
                background: 'rgba(9,9,15,0.6)',
                backdropFilter: 'blur(12px)',
                padding: '4px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.08)'
              }}>
                {DAYS_OF_WEEK.map(({ key, label }) => {
                  const isActive = selectedDay === key;
                  const isToday = todayKey === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedDay(key)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: isActive
                          ? 'var(--accent-primary)'
                          : 'transparent',
                        color: isActive
                          ? 'white'
                          : (isToday ? 'var(--text-accent)' : 'var(--text-secondary)'),
                        cursor: 'pointer',
                        border: 'none',
                        transition: 'var(--transition)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      {label}
                      {isToday && (
                        <span style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: isActive ? 'white' : 'var(--text-accent)',
                          display: 'inline-block'
                        }} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Schedule Anime List */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '16px',
            }}>
              {scheduleLoading ? (
                Array.from({ length: 6 }).map((_, i) => <AnimeCardSkeleton key={i} />)
              ) : scheduleAnime.length > 0 ? (
                scheduleAnime.slice(0, 12).map((anime, i) => (
                  <AnimeCard
                    key={`sched-${anime.mal_id}-${i}`}
                    anime={anime}
                    index={i}
                    badgeText={anime.broadcast?.time || ''}
                  />
                ))
              ) : (
                <div style={{
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  padding: '48px 24px',
                  background: 'rgba(9,9,15,0.5)',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  color: 'var(--text-muted)'
                }}>
                  Tidak ada anime yang dijadwalkan tayang pada hari ini.
                </div>
              )}
            </div>
          </div>
        </section>



        {/* ===== Two Column Layout ===== */}
        <div className="home-two-columns" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 380px',
          gap: '40px',
          marginBottom: '56px',
        }}>
          {/* Seasonal Anime — Horizontal Scroll Cards */}
          <section style={{ minWidth: 0 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
            }}>
              <h2 className="section-title">Season Ini (Ongoing)</h2>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {[
                  { dir: -1, icon: '‹' },
                  { dir: 1, icon: '›' },
                ].map((btn, i) => (
                  <button
                    key={i}
                    onClick={() => scroll(btn.dir)}
                    style={{
                      width: 32, height: 32,
                      borderRadius: '8px',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-card)',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontSize: '1.2rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'var(--transition)',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'var(--accent-primary)';
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'var(--bg-elevated)';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }}
                  >
                    {btn.icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Row */}
            <div
              ref={scrollRef}
              style={{
                display: 'flex',
                gap: '12px',
                overflowX: 'auto',
                paddingBottom: '12px',
                scrollbarWidth: 'none',
              }}
            >
              <style>{`::-webkit-scrollbar { display: none; }`}</style>
              {seasonalLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} style={{ flexShrink: 0, width: 140 }}>
                    <AnimeCardSkeleton />
                  </div>
                ))
                : seasonalAnime.map((anime, i) => (
                  <div key={`seasonal-${anime.mal_id}-${i}`} style={{ flexShrink: 0, width: 145 }}>
                    <AnimeCard anime={anime} index={i} />
                  </div>
                ))
              }
            </div>
          </section>

          {/* Sidebar: Top Anime List */}
          <section>
            <SectionHeader title="Top Anime Rating" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {popularLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 88, borderRadius: 'var(--radius-md)' }} />
                ))
                : popularAnime.slice(0, 8).map((anime, i) => (
                  <div key={`top-${anime.mal_id}-${i}`} style={{ position: 'relative' }}>
                    {/* Rank number */}
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '-20px',
                      transform: 'translateY(-50%)',
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 800,
                      fontSize: i < 3 ? '1.2rem' : '0.9rem',
                      color: i < 3 ? 'var(--text-accent)' : 'var(--text-muted)',
                      width: '20px',
                      textAlign: 'right',
                    }}>
                      {i + 1}
                    </div>
                    <AnimeCardWide anime={anime} index={i} />
                  </div>
                ))
              }
            </div>
          </section>
        </div>


      </div>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '32px 24px',
        textAlign: 'center',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '8px',
        }}>
          <div style={{
            width: 24, height: 24,
            borderRadius: '6px',
            background: 'var(--gradient-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: 800,
            color: 'white',
          }}>K</div>
          <span style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 700,
            fontSize: '1rem',
            background: 'var(--gradient-accent)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Kubahanime
          </span>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Powered by Jikan & MyAnimeList API · © 2026 Kubahanime
        </p>
      </footer>
    </div>
  );
}
