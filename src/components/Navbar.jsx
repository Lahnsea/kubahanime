import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';
import { useSearchAnime, extractTitle, extractCover } from '../hooks/useAnime';
import AuthModal from './AuthModal';

const GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy',
  'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life',
  'Sports', 'Supernatural', 'Suspense', 'Award Winning',
  'Avant Garde', 'Boys Love', 'Girls Love', 'Gourmet',
];

// ── Genre Dropdown ─────────────────────────────────────────────────────────────
function GenreDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  let closeTimer = null;

  const handleMouseEnter = () => {
    clearTimeout(closeTimer);
    setOpen(true);
  };
  const handleMouseLeave = () => {
    closeTimer = setTimeout(() => setOpen(false), 120);
  };

  return (
    <div
      ref={ref}
      style={{ position: 'relative' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        style={{
          padding: '6px 12px', borderRadius: 'var(--radius-sm)',
          color: open ? 'var(--text-primary)' : 'var(--text-secondary)',
          fontSize: '0.85rem', fontWeight: 500,
          background: open ? 'var(--bg-elevated)' : 'transparent',
          border: 'none', cursor: 'pointer',
          transition: 'var(--transition)',
          display: 'flex', alignItems: 'center', gap: '5px',
        }}
      >
        Genre
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0)' }}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0,
          width: 340,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          padding: '12px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '4px',
          animation: 'fadeIn 0.15s ease',
          zIndex: 200,
        }}>
          {GENRES.map(g => (
            <button
              key={g}
              onClick={() => { navigate(`/genre?genre=${encodeURIComponent(g)}`); setOpen(false); }}
              style={{
                padding: '8px 10px',
                borderRadius: '8px',
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: '0.8rem',
                fontWeight: 500,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'var(--transition)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(124,58,237,0.12)';
                e.currentTarget.style.color = 'var(--text-accent)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'none';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              {g}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Server Toggle Button ──────────────────────────────────────────────────────
function ServerToggle() {
  const { lang, toggleLang } = useLang();
  const isID = lang === 'id'; // 'id' maps to Subbed, 'en' maps to Dubbed

  return (
    <button
      onClick={toggleLang}
      title={isID ? 'Ganti ke Server Dubbed' : 'Ganti ke Server Subtitled'}
      style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '6px 12px',
        borderRadius: '99px',
        border: `1px solid ${isID ? 'rgba(124,58,237,0.35)' : 'rgba(59,130,246,0.35)'}`,
        background: isID ? 'rgba(124,58,237,0.1)' : 'rgba(59,130,246,0.1)',
        color: isID ? '#a78bfa' : '#60a5fa',
        fontFamily: 'Outfit, sans-serif', fontWeight: 700,
        fontSize: '0.75rem', cursor: 'pointer',
        transition: 'all 0.25s ease',
        flexShrink: 0,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'scale(1.05)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      <span style={{ fontSize: '1rem' }}>{isID ? '📝' : '🗣️'}</span>
      {isID ? 'Subbed' : 'Dubbed'}
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ opacity: 0.7 }}>
        <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    </button>
  );
}

// ── User Avatar Menu ──────────────────────────────────────────────────────────
function UserMenu({ user }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = user.displayName
    ? user.displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : user.email?.[0]?.toUpperCase() || 'U';

  const menuItems = [
    { icon: '👤', label: 'Profil Saya', path: '/profile' },
    { icon: '❤️', label: 'Favorit', path: '/profile?tab=favorites' },
    { icon: '📚', label: 'Watchlist', path: '/profile?tab=watchlist' },
    { icon: '🕐', label: 'Riwayat Nonton', path: '/profile?tab=history' },
  ];

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: 36, height: 36, borderRadius: '50%',
          background: user.photoURL ? 'transparent' : 'var(--gradient-accent)',
          border: '2px solid var(--border-accent)',
          cursor: 'pointer', overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'var(--transition)',
          boxShadow: open ? '0 0 0 3px rgba(124,58,237,0.25)' : 'none',
        }}
      >
        {user.photoURL ? (
          <img src={user.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.8rem', color: 'white' }}>
            {initials}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          width: 220,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          animation: 'fadeIn 0.15s ease',
          zIndex: 200,
        }}>
          {/* User info header */}
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--border-subtle)',
          }}>
            <div style={{
              fontFamily: 'Outfit, sans-serif', fontWeight: 700,
              fontSize: '0.9rem', color: 'var(--text-primary)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {user.displayName || 'Pengguna'}
            </div>
            <div style={{
              fontSize: '0.75rem', color: 'var(--text-muted)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {user.email}
            </div>
          </div>

          {/* Menu items */}
          {menuItems.map(item => (
            <button
              key={item.path}
              onClick={() => { navigate(item.path); setOpen(false); }}
              style={{
                width: '100%', padding: '10px 16px',
                display: 'flex', alignItems: 'center', gap: '10px',
                background: 'none', border: 'none',
                color: 'var(--text-secondary)', cursor: 'pointer',
                fontSize: '0.875rem', textAlign: 'left',
                transition: 'var(--transition)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--bg-elevated)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'none';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}

          <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '4px 0' }} />

          {/* Logout */}
          <button
            onClick={() => { logout(); setOpen(false); }}
            style={{
              width: '100%', padding: '10px 16px',
              display: 'flex', alignItems: 'center', gap: '10px',
              background: 'none', border: 'none',
              color: '#f87171', cursor: 'pointer',
              fontSize: '0.875rem', textAlign: 'left',
              transition: 'var(--transition)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <span>🚪</span>
            Keluar
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main Navbar ───────────────────────────────────────────────────────────────
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const { query, setQuery, data: searchResults, loading: searchLoading } = useSearchAnime();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') { setSearchOpen(false); setQuery(''); }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault(); setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setQuery]);

  const handleResultClick = (id) => {
    navigate(`/anime/${id}`);
    setSearchOpen(false);
    setQuery('');
  };

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: 'var(--navbar-height)',
        display: 'flex', alignItems: 'center',
        padding: '0 24px', gap: '12px',
        transition: 'all 0.3s ease',
        background: scrolled ? 'rgba(9,9,15,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border-subtle)' : 'none',
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', flexShrink: 0 }}>
          <div style={{
            width: 34, height: 34, borderRadius: '9px',
            background: 'var(--gradient-accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif',
            color: 'white', boxShadow: '0 0 16px rgba(124,58,237,0.45)',
          }}>K</div>
          <span style={{
            fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.15rem',
            background: 'var(--gradient-accent)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Kubahanime</span>
        </Link>

        {/* Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginLeft: '16px' }}>
          {[
            { label: 'Beranda', path: '/' },
            { label: 'Populer', path: '/popular' },
            { label: 'Terbaru', path: '/latest' },
          ].map(({ label, path }) => (
            <Link key={path} to={path}
              style={{
                padding: '6px 12px', borderRadius: 'var(--radius-sm)',
                color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500,
                transition: 'var(--transition)',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-elevated)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; }}
            >{label}</Link>
          ))}
          {/* Genre Dropdown */}
          <GenreDropdown />
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Search */}
        <button
          onClick={() => setSearchOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '7px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-card)',
            color: 'var(--text-muted)', fontSize: '0.85rem',
            transition: 'var(--transition)', cursor: 'pointer',
            minWidth: 180,
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-accent)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-card)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          Cari anime...
          <span style={{ marginLeft: 'auto', fontSize: '0.68rem', opacity: 0.45 }}>Ctrl+K</span>
        </button>

        {/* Server Toggle */}
        <ServerToggle />

        {/* Auth */}
        {isLoggedIn ? (
          <UserMenu user={user} />
        ) : (
          <button
            onClick={() => setAuthOpen(true)}
            className="btn-primary"
            style={{ padding: '7px 18px', fontSize: '0.85rem' }}
          >
            Masuk
          </button>
        )}
      </nav>

      {/* Search Modal */}
      {searchOpen && (
        <div
          onClick={e => { if (e.target === e.currentTarget) { setSearchOpen(false); setQuery(''); } }}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            paddingTop: '80px', paddingLeft: '16px', paddingRight: '16px',
          }}
        >
          <div style={{
            width: '100%', maxWidth: 640,
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-card)',
            overflow: 'hidden',
            boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,58,237,0.2)',
            animation: 'fadeIn 0.2s ease',
          }}>
            {/* Input */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '14px 18px',
              borderBottom: '1px solid var(--border-subtle)',
            }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                ref={searchRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && query.trim()) {
                    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
                    setSearchOpen(false);
                    setQuery('');
                  }
                }}
                placeholder="Cari judul anime..."
                style={{
                  flex: 1, background: 'none', border: 'none', outline: 'none',
                  color: 'var(--text-primary)', fontSize: '1rem', fontFamily: 'inherit',
                }}
              />
              <div style={{ display: 'flex', gap: '6px' }}>
                {query && (
                  <button onClick={() => setQuery('')} style={{ background: 'var(--bg-elevated)', border: 'none', color: 'var(--text-muted)', borderRadius: '6px', padding: '4px 8px', fontSize: '0.72rem', cursor: 'pointer' }}>Clear</button>
                )}
                <button onClick={() => { setSearchOpen(false); setQuery(''); }} style={{ background: 'var(--bg-elevated)', border: 'none', color: 'var(--text-muted)', borderRadius: '6px', padding: '4px 8px', fontSize: '0.72rem', cursor: 'pointer' }}>ESC</button>
              </div>
            </div>

            <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
              {searchLoading && (
                <div style={{ padding: '28px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <div style={{ width: 22, height: 22, border: '2px solid var(--border-card)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 8px' }} />
                  Mencari...
                </div>
              )}

              {!searchLoading && query && searchResults.length === 0 && (
                <div style={{ padding: '28px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Tidak ada hasil untuk "<strong style={{ color: 'var(--text-secondary)' }}>{query}</strong>"
                </div>
              )}

              {!searchLoading && searchResults.map(anime => {
                const title = extractTitle(anime);
                const coverUrl = extractCover(anime);
                const status = anime.status;
                const score = anime.score;

                return (
                  <button
                    key={anime.mal_id}
                    onClick={() => handleResultClick(anime.mal_id)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '11px 18px', background: 'none', border: 'none',
                      cursor: 'pointer', textAlign: 'left', transition: 'var(--transition)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    {coverUrl ? (
                      <img src={coverUrl} alt={title} style={{ width: 38, height: 54, objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 38, height: 54, borderRadius: '6px', background: 'var(--bg-elevated)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🎬</div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {title}
                      </div>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span className="badge badge-ongoing" style={{ textTransform: 'capitalize' }}>{anime.type || 'TV'}</span>
                        {score && (
                          <span style={{ fontSize: '0.65rem', padding: '2px 7px', borderRadius: '99px', background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                            ⭐ {score}
                          </span>
                        )}
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{status}</span>
                      </div>
                    </div>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                  </button>
                );
              })}

              {!query && (
                <div style={{ padding: '20px 18px' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Pencarian Cepat</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {['One Piece', 'Naruto', 'Boruto', 'Attack on Titan', 'Jujutsu Kaisen', 'Bleach', 'Dragon Ball'].map(t => (
                      <button key={t} onClick={() => setQuery(t)}
                        style={{ padding: '6px 13px', borderRadius: '99px', background: 'var(--bg-elevated)', border: '1px solid var(--border-card)', color: 'var(--text-secondary)', fontSize: '0.8rem', cursor: 'pointer', transition: 'var(--transition)' }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-accent)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-card)'}
                      >{t}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* View all results */}
              {query.trim() && !searchLoading && searchResults.length > 0 && (
                <div style={{ borderTop: '1px solid var(--border-subtle)', padding: '10px 18px' }}>
                  <button
                    onClick={() => {
                      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
                      setSearchOpen(false);
                      setQuery('');
                    }}
                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', background: 'rgba(124,58,237,0.08)', border: '1px solid var(--border-accent)', color: 'var(--text-accent)', fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', transition: 'var(--transition)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,58,237,0.15)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(124,58,237,0.08)'}
                  >
                    Lihat semua hasil untuk "{query}" →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
