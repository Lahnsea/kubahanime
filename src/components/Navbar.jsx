import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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

// ── Genre Dropdown (Crunchyroll-style hover mega-menu) ────────────────────
function GenreDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  let closeTimer = null;

  const handleMouseEnter = () => { clearTimeout(closeTimer); setOpen(true); };
  const handleMouseLeave = () => { closeTimer = setTimeout(() => setOpen(false), 120); };

  return (
    <div ref={ref} style={{ position: 'relative' }} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <button style={{
        padding: '6px 12px', borderRadius: '8px',
        color: open ? 'var(--accent-primary)' : 'var(--text-secondary)',
        fontSize: '0.85rem', fontWeight: 600,
        background: open ? 'rgba(244,117,33,0.08)' : 'transparent',
        border: 'none', cursor: 'pointer',
        transition: 'var(--transition)',
        display: 'flex', alignItems: 'center', gap: '5px',
        fontFamily: 'Outfit, sans-serif',
      }}>
        Genre
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0)' }}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 10px)', left: 0,
          width: 360,
          background: 'rgba(18,18,22,0.96)', backdropFilter: 'blur(20px)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
          padding: '14px',
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
          gap: '4px',
          animation: 'fadeIn 0.15s ease',
          zIndex: 200,
        }}>
          {GENRES.map(g => (
            <button
              key={g}
              onClick={() => { navigate(`/genre?genre=${encodeURIComponent(g)}`); setOpen(false); }}
              style={{
                padding: '8px 10px', borderRadius: '8px',
                background: 'none', border: 'none',
                color: 'var(--text-secondary)', fontSize: '0.78rem',
                fontWeight: 600, cursor: 'pointer',
                textAlign: 'left', transition: 'var(--transition)',
                fontFamily: 'Outfit, sans-serif',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(244,117,33,0.1)'; e.currentTarget.style.color = 'var(--accent-primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              {g}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Server/Lang Toggle ───────────────────────────────────────────────────────
function ServerToggle() {
  const { lang, toggleLang } = useLang();
  const isID = lang === 'id';

  return (
    <button
      onClick={toggleLang}
      className="nav-server-toggle"
      title={isID ? 'Ganti ke Server Dubbed' : 'Ganti ke Server Subtitled'}
      style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '7px 14px', borderRadius: '99px',
        border: `1px solid ${isID ? 'rgba(244,117,33,0.4)' : 'rgba(59,130,246,0.4)'}`,
        background: isID ? 'rgba(244,117,33,0.08)' : 'rgba(59,130,246,0.08)',
        color: isID ? 'var(--accent-primary)' : '#60a5fa',
        fontFamily: 'Outfit, sans-serif', fontWeight: 700,
        fontSize: '0.75rem', cursor: 'pointer',
        transition: 'all 0.25s ease', flexShrink: 0,
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
    >
      <span style={{ fontSize: '0.95rem' }}>{isID ? '📝' : '🗣️'}</span>
      <span className="nav-server-toggle-text">{isID ? 'Subbed' : 'Dubbed'}</span>
      <svg className="nav-server-toggle-icon" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ opacity: 0.7 }}>
        <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    </button>
  );
}

// ── User Avatar dropdown ─────────────────────────────────────────────────────
function UserMenu({ user }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = user.displayName
    ? user.displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : user.email?.[0]?.toUpperCase() || 'U';

  const menuItems = [
    { icon: '👤', label: 'Profil Saya',     path: '/profile' },
    { icon: '❤️', label: 'Favorit',         path: '/profile?tab=favorites' },
    { icon: '📚', label: 'Watchlist',        path: '/profile?tab=watchlist' },
    { icon: '🕐', label: 'Riwayat Nonton',  path: '/profile?tab=history' },
  ];

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: 36, height: 36, borderRadius: '50%',
          background: user.photoURL ? 'transparent' : 'var(--accent-primary)',
          border: `2px solid ${open ? 'var(--accent-primary)' : 'rgba(244,117,33,0.4)'}`,
          cursor: 'pointer', overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'var(--transition)',
          boxShadow: open ? '0 0 0 3px rgba(244,117,33,0.2)' : 'none',
        }}
      >
        {user.photoURL ? (
          <img src={user.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '0.8rem', color: 'white' }}>
            {initials}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 10px)', right: 0,
          width: 220,
          background: 'rgba(18,18,22,0.97)', backdropFilter: 'blur(20px)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
          overflow: 'hidden',
          animation: 'scaleIn 0.15s ease',
          zIndex: 200,
        }}>
          {/* User info header */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '0.9rem', marginBottom: '2px' }}>
              {user.displayName || 'Pengguna'}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.email}
            </div>
          </div>

          {/* Menu items */}
          <div style={{ padding: '6px' }}>
            {menuItems.map(({ icon, label, path }) => (
              <button
                key={path}
                onClick={() => { navigate(path); setOpen(false); }}
                style={{
                  width: '100%', padding: '9px 12px', borderRadius: '8px',
                  background: 'none', border: 'none',
                  color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600,
                  cursor: 'pointer', textAlign: 'left',
                  display: 'flex', alignItems: 'center', gap: '10px',
                  transition: 'var(--transition)', fontFamily: 'Outfit, sans-serif',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(244,117,33,0.08)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                <span>{icon}</span>{label}
              </button>
            ))}
          </div>

          {/* Logout */}
          <div style={{ padding: '6px', borderTop: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => { logout(); setOpen(false); }}
              style={{
                width: '100%', padding: '9px 12px', borderRadius: '8px',
                background: 'none', border: 'none',
                color: '#f87171', fontSize: '0.85rem', fontWeight: 600,
                cursor: 'pointer', textAlign: 'left',
                display: 'flex', alignItems: 'center', gap: '10px',
                transition: 'var(--transition)', fontFamily: 'Outfit, sans-serif',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              🚪 Keluar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Search Bar with live suggestions ────────────────────────────────────────
function NavSearchBar({ onClose }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const { data: results = [], loading } = useSearchAnime(query);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) { navigate(`/search?q=${encodeURIComponent(query.trim())}`); onClose?.(); }
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', gap: '10px',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-accent)',
          borderRadius: 'var(--radius-md)',
          padding: '0 14px',
          boxShadow: '0 0 0 3px rgba(244,117,33,0.1)',
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Cari anime…"
            style={{
              flex: 1, padding: '11px 0',
              background: 'none', border: 'none',
              color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif',
              fontSize: '0.9rem', outline: 'none',
            }}
          />
          {query && (
            <button type="button" onClick={() => setQuery('')}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem', lineHeight: 1 }}>
              ✕
            </button>
          )}
        </div>
        {onClose && (
          <button type="button" onClick={onClose}
            style={{
              padding: '10px 14px', borderRadius: 'var(--radius-md)',
              background: 'var(--bg-elevated)', border: '1px solid var(--border-card)',
              color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.82rem',
              fontFamily: 'Outfit', fontWeight: 600,
            }}>
            Batal
          </button>
        )}
      </form>

      {/* Live suggestions */}
      {query.length >= 2 && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
          background: 'rgba(18,18,22,0.97)', backdropFilter: 'blur(20px)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
          overflowY: 'auto',
          maxHeight: '350px',
          animation: 'fadeIn 0.15s ease',
          zIndex: 300,
        }}>
          {loading ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Mencari…
            </div>
          ) : results.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Tidak ditemukan untuk "{query}"
            </div>
          ) : (
            <div style={{ padding: '6px' }}>
              {results.map(anime => {
                const title = extractTitle(anime);
                const cover = extractCover(anime);
                return (
                  <button
                    key={anime.mal_id}
                    onClick={() => { navigate(`/anime/${anime.mal_id}`); onClose?.(); setQuery(''); }}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: '10px',
                      background: 'none', border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '12px',
                      textAlign: 'left', transition: 'var(--transition)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(244,117,33,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    {cover ? (
                      <img src={cover} alt={title} style={{ width: 36, height: 50, objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 36, height: 50, borderRadius: '6px', background: 'var(--bg-elevated)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🎬</div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontFamily: 'Outfit', fontWeight: 700, fontSize: '0.85rem',
                        color: 'var(--text-primary)', marginBottom: '3px',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>{title}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {anime.type || 'TV'} • {anime.episodes || '?'} Ep{anime.score ? ` • ⭐ ${anime.score}` : ''}
                      </div>
                    </div>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </button>
                );
              })}
              <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '4px 0 0' }}>
                <button
                  onClick={() => { navigate(`/search?q=${encodeURIComponent(query)}`); onClose?.(); setQuery(''); }}
                  style={{
                    width: '100%', padding: '11px 14px', background: 'none', border: 'none',
                    color: 'var(--accent-primary)', fontFamily: 'Outfit', fontWeight: 700,
                    fontSize: '0.8rem', cursor: 'pointer', textAlign: 'center',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    borderRadius: '0 0 var(--radius-xl) var(--radius-xl)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(244,117,33,0.07)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                  </svg>
                  Cari semua hasil untuk "{query}"
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Mobile Drawer ────────────────────────────────────────────────────────────
function MobileDrawer({ onClose, onOpenAuth }) {
  const { isLoggedIn, user, logout } = useAuth();
  const { lang, toggleLang } = useLang();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);

  const navLinks = [
    { to: '/',        icon: '🏠', label: 'Beranda' },
    { to: '/popular', icon: '🔥', label: 'Populer' },
    { to: '/latest',  icon: '🆕', label: 'Terbaru' },
    { to: '/schedule',icon: '📅', label: 'Jadwal' },
    { to: '/genre',   icon: '🎭', label: 'Genre' },
  ];

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(4px)', zIndex: 998,
          animation: 'fadeIn 0.2s ease',
        }}
      />
      {/* Drawer */}
      <div className="mobile-drawer" style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: 'min(320px, 88vw)',
        background: 'rgba(18,18,22,0.98)', backdropFilter: 'blur(20px)',
        borderLeft: '1px solid var(--border-card)',
        zIndex: 999,
        display: 'flex', flexDirection: 'column',
        overflowY: 'auto',
      }}>
        {/* Drawer header */}
        <div style={{
          padding: '18px 20px', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-subtle)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: 28, height: 28, borderRadius: '7px', background: 'var(--accent-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Outfit', fontWeight: 900, color: 'white', fontSize: '0.9rem',
            }}>K</div>
            <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>Kubahanime</span>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: '8px',
            background: 'var(--bg-elevated)', border: '1px solid var(--border-card)',
            color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>

        {/* Search */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
          <NavSearchBar onClose={onClose} />
        </div>

        {/* Nav links */}
        <nav style={{ padding: '10px 12px', flex: 1 }}>
          {navLinks.map(({ to, icon, label }) => (
            <button key={to}
              onClick={() => { navigate(to); onClose(); }}
              style={{
                width: '100%', padding: '12px 14px', borderRadius: '10px',
                background: 'none', border: 'none',
                color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600,
                cursor: 'pointer', textAlign: 'left',
                display: 'flex', alignItems: 'center', gap: '12px',
                transition: 'var(--transition)', fontFamily: 'Outfit, sans-serif',
                marginBottom: '2px',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(244,117,33,0.08)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              <span style={{ fontSize: '1.1rem', width: '22px', textAlign: 'center' }}>{icon}</span>
              {label}
            </button>
          ))}

          {/* Server toggle */}
          <div style={{ padding: '10px 14px', marginTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
            <button onClick={toggleLang} style={{
              width: '100%', padding: '11px 14px', borderRadius: '10px',
              background: 'rgba(244,117,33,0.07)', border: '1px solid rgba(244,117,33,0.2)',
              color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 700,
              cursor: 'pointer', textAlign: 'left',
              display: 'flex', alignItems: 'center', gap: '10px',
              fontFamily: 'Outfit, sans-serif',
            }}>
              <span>{lang === 'id' ? '📝' : '🗣️'}</span>
              Server: {lang === 'id' ? 'Subbed' : 'Dubbed'} — Klik untuk ganti
            </button>
          </div>
        </nav>

        {/* User section */}
        <div style={{ padding: '12px', borderTop: '1px solid var(--border-subtle)' }}>
          {isLoggedIn && user ? (
            <>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 14px', borderRadius: '10px', marginBottom: '8px',
                background: 'var(--bg-elevated)',
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: 'var(--accent-primary)', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Outfit', fontWeight: 800, color: 'white', fontSize: '0.9rem',
                }}>
                  {user.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '0.88rem' }}>
                    {user.displayName || 'Pengguna'}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.email}
                  </div>
                </div>
              </div>
              <button
                onClick={() => { navigate('/profile'); onClose(); }}
                style={{
                  width: '100%', padding: '11px', borderRadius: '10px', marginBottom: '6px',
                  background: 'rgba(244,117,33,0.1)', border: '1px solid rgba(244,117,33,0.25)',
                  color: 'var(--accent-primary)', fontFamily: 'Outfit', fontWeight: 700,
                  fontSize: '0.85rem', cursor: 'pointer',
                }}
              >👤 Lihat Profil</button>
              <button
                onClick={() => { logout(); onClose(); }}
                style={{
                  width: '100%', padding: '11px', borderRadius: '10px',
                  background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)',
                  color: '#f87171', fontFamily: 'Outfit', fontWeight: 700,
                  fontSize: '0.85rem', cursor: 'pointer',
                }}
              >🚪 Keluar</button>
            </>
          ) : (
            <button
              onClick={() => { onOpenAuth(); onClose(); }}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '13px' }}
            >🔐 Masuk / Daftar</button>
          )}
        </div>
      </div>
    </>
  );
}

// ── MAIN NAVBAR ──────────────────────────────────────────────────────────────
export default function Navbar() {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    setDrawerOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { to: '/',        label: 'Beranda' },
    { to: '/popular', label: 'Populer' },
    { to: '/latest',  label: 'Terbaru' },
    { to: '/schedule',label: 'Jadwal' },
  ];

  const isActive = (to) => location.pathname === to;

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        height: 'var(--navbar-height)',
        zIndex: 100,
        background: scrolled
          ? 'rgba(10,10,12,0.92)'
          : 'linear-gradient(to bottom, rgba(10,10,12,0.85) 0%, rgba(10,10,12,0.3) 100%)',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border-subtle)' : 'none',
        transition: 'background 0.35s ease, border-color 0.35s ease, backdrop-filter 0.35s ease',
        boxShadow: scrolled ? '0 4px 32px rgba(0,0,0,0.4)' : 'none',
      }}>
        <div style={{
          maxWidth: 1440, margin: '0 auto',
          height: '100%', padding: '0 28px',
          display: 'flex', alignItems: 'center', gap: '24px',
        }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flexShrink: 0 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '9px',
              background: 'var(--accent-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Outfit', fontWeight: 900, color: 'white',
              fontSize: '1rem', boxShadow: '0 0 16px rgba(244,117,33,0.45)',
            }}>K</div>
            <span style={{
              fontFamily: 'Outfit', fontWeight: 900, fontSize: '1.15rem',
              background: 'var(--gradient-accent)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text', letterSpacing: '-0.01em',
            }}>Kubahanime</span>
          </Link>

          {/* Desktop nav links */}
          <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            {navLinks.map(({ to, label }) => (
              <Link key={to} to={to} style={{
                padding: '6px 13px', borderRadius: '8px',
                fontFamily: 'Outfit', fontWeight: 600, fontSize: '0.875rem',
                color: isActive(to) ? 'var(--accent-primary)' : 'var(--text-secondary)',
                background: isActive(to) ? 'rgba(244,117,33,0.1)' : 'transparent',
                textDecoration: 'none', transition: 'var(--transition)',
              }}
                onMouseEnter={e => { if (!isActive(to)) { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; } }}
                onMouseLeave={e => { if (!isActive(to)) { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; } }}
              >{label}</Link>
            ))}
            <GenreDropdown />
          </div>

          {/* Search — inline when open, button when closed */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
            {searchOpen ? (
              <div style={{ flex: 1, maxWidth: 480, animation: 'fadeIn 0.2s ease' }}>
                <NavSearchBar onClose={() => setSearchOpen(false)} />
              </div>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="nav-search-btn"
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '8px 16px', borderRadius: 'var(--radius-md)',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid var(--border-card)',
                  color: 'var(--text-muted)', cursor: 'pointer',
                  transition: 'var(--transition)', minWidth: 190,
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-accent)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-card)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                </svg>
                <span className="nav-search-text" style={{ flex: 1, fontSize: '0.82rem', fontFamily: 'Outfit', textAlign: 'left' }}>Cari anime…</span>
                <kbd className="nav-search-shortcut" style={{
                  fontSize: '0.65rem', padding: '2px 5px', borderRadius: '4px',
                  background: 'rgba(255,255,255,0.08)', border: '1px solid var(--border-card)',
                  color: 'var(--text-muted)', fontFamily: 'monospace',
                }}>⌘K</kbd>
              </button>
            )}

            {/* Server toggle */}
            {!searchOpen && <ServerToggle />}

            {/* Auth / User */}
            {!searchOpen && (
              isLoggedIn && user ? (
                <UserMenu user={user} />
              ) : (
                <button onClick={() => setAuthOpen(true)} className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
                  Masuk
                </button>
              )
            )}

            {/* Hamburger — mobile only */}
            <button
              className="mobile-menu-toggle"
              onClick={() => setDrawerOpen(true)}
              style={{
                display: 'none', width: 38, height: 38, borderRadius: '10px',
                background: 'var(--bg-elevated)', border: '1px solid var(--border-card)',
                color: 'var(--text-secondary)', cursor: 'pointer', flexShrink: 0,
                alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 5,
              }}
            >
              <span style={{ display: 'block', width: 18, height: 2, background: 'currentColor', borderRadius: 2 }} />
              <span style={{ display: 'block', width: 14, height: 2, background: 'currentColor', borderRadius: 2 }} />
              <span style={{ display: 'block', width: 18, height: 2, background: 'currentColor', borderRadius: 2 }} />
            </button>
          </div>
        </div>

        {/* Crunchyroll-style orange bottom accent line on scroll */}
        {scrolled && (
          <div style={{
            position: 'absolute', bottom: 0, left: 0,
            height: '2px', background: 'var(--gradient-accent)',
            transition: 'width 0.6s ease',
            width: '100%',
          }} />
        )}
      </nav>

      {/* Mobile Drawer */}
      {drawerOpen && <MobileDrawer onClose={() => setDrawerOpen(false)} onOpenAuth={() => setAuthOpen(true)} />}

      {/* Auth Modal */}
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </>
  );
}
