import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites, useWatchlist, useHistory } from '../hooks/useUserData';
import AuthModal from '../components/AuthModal';

function AnimeListItem({ item, onRemove, removeLabel = 'Hapus' }) {
  const [removing, setRemoving] = useState(false);

  async function handleRemove() {
    setRemoving(true);
    await onRemove(item.id);
    setRemoving(false);
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '14px',
      padding: '12px 16px',
      borderRadius: 'var(--radius-md)',
      background: 'var(--bg-card)',
      border: '1px solid var(--border-card)',
      animation: 'fadeIn 0.3s ease',
    }}>
      <Link to={`/anime/${item.id}`} style={{ flexShrink: 0 }}>
        {item.cover ? (
          <img src={item.cover} alt={item.title} style={{ width: 44, height: 62, objectFit: 'cover', borderRadius: '7px' }} />
        ) : (
          <div style={{ width: 44, height: 62, borderRadius: '7px', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>🎬</div>
        )}
      </Link>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Link to={`/anime/${item.id}`} style={{ textDecoration: 'none' }}>
          <div style={{
            fontFamily: 'Outfit, sans-serif', fontWeight: 700,
            fontSize: '0.9rem', color: 'var(--text-primary)',
            marginBottom: '4px',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{item.title}</div>
        </Link>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          {item.type && (
            <span className="badge badge-ongoing" style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>{item.type}</span>
          )}
          {item.lastEpisodeNum && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-accent)', fontWeight: 600 }}>
              Terakhir: Ep. {item.lastEpisodeNum}
            </span>
          )}
          {item.watchedAt && (
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {new Date(item.watchedAt?.seconds * 1000).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
            </span>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
        {item.lastEpisodeNum && (
          <Link
            to={`/watch/${item.id}/episode/${item.lastEpisodeNum}`}
            className="btn-primary"
            style={{ padding: '6px 12px', fontSize: '0.75rem', textDecoration: 'none' }}
          >
            Lanjut Nonton
          </Link>
        )}
        {onRemove && (
          <button
            onClick={handleRemove}
            disabled={removing}
            style={{
              padding: '6px 12px', borderRadius: 'var(--radius-sm)',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
              color: '#f87171', fontSize: '0.75rem', cursor: 'pointer',
              transition: 'var(--transition)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
          >
            {removing ? '...' : removeLabel}
          </button>
        )}
      </div>
    </div>
  );
}

function EmptyState({ icon, title, desc, link, linkLabel }) {
  return (
    <div style={{
      padding: '60px 24px', textAlign: 'center',
      background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border-card)',
    }}>
      <div style={{ fontSize: '3rem', marginBottom: '16px' }}>{icon}</div>
      <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, marginBottom: '8px' }}>{title}</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '20px' }}>{desc}</p>
      {link && <Link to={link} className="btn-primary" style={{ textDecoration: 'none' }}>{linkLabel}</Link>}
    </div>
  );
}

const TABS = [
  { key: 'favorites', label: '❤️ Favorit' },
  { key: 'watchlist', label: '📚 Watchlist' },
  { key: 'history', label: '🕐 Riwayat' },
];

export default function ProfilePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'favorites';
  const { user, isLoggedIn, logout } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  const { getFavorites, removeFavorite } = useFavorites();
  const { getWatchlist, removeFromWatchlist } = useWatchlist();
  const { getHistory, clearHistory } = useHistory();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) { setLoading(false); return; }
    setLoading(true);
    const fetchers = { favorites: getFavorites, watchlist: getWatchlist, history: getHistory };
    fetchers[activeTab]?.()
      .then(res => {
        // Deduplicate by id to prevent duplicate key error
        const items = res || [];
        const seen = new Set();
        const unique = items.filter(item => {
          if (!item.id || seen.has(item.id)) return false;
          seen.add(item.id);
          return true;
        });
        setData(unique);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [activeTab, isLoggedIn, getFavorites, getWatchlist, getHistory]);

  async function handleRemove(animeId) {
    if (activeTab === 'favorites') await removeFavorite(animeId);
    if (activeTab === 'watchlist') await removeFromWatchlist(animeId);
    if (activeTab === 'history') await clearHistory(animeId);
    setData(prev => prev.filter(item => item.id !== animeId));
  }

  async function handleClearHistory() {
    if (!window.confirm('Hapus semua riwayat nonton?')) return;
    await clearHistory();
    setData([]);
  }

  if (!isLoggedIn) {
    return (
      <div style={{ paddingTop: 'var(--navbar-height)' }}>
        <div className="container" style={{ paddingTop: '80px', paddingBottom: '80px', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🔐</div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.8rem', marginBottom: '12px' }}>
            Masuk untuk melihat profil
          </h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '28px', maxWidth: '400px', margin: '0 auto 28px' }}>
            Login untuk mengakses favorit, watchlist, dan riwayat nonton kamu.
          </p>
          <button onClick={() => setAuthOpen(true)} className="btn-primary">
            Masuk Sekarang
          </button>
        </div>
        {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
      </div>
    );
  }

  const initials = user.displayName
    ? user.displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : user.email?.[0]?.toUpperCase() || 'U';

  return (
    <div style={{ paddingTop: 'var(--navbar-height)' }}>
      <div className="container" style={{ paddingTop: '40px', paddingBottom: '64px' }}>
        {/* Profile Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '20px',
          padding: '24px',
          borderRadius: 'var(--radius-xl)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-card)',
          marginBottom: '28px',
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: user.photoURL ? 'transparent' : 'var(--gradient-accent)',
            border: '3px solid var(--border-accent)',
            overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            {user.photoURL ? (
              <img src={user.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.5rem', color: 'white' }}>
                {initials}
              </span>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.4rem', marginBottom: '4px' }}>
              {user.displayName || 'Pengguna'}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{user.email}</p>
          </div>
          <button
            onClick={logout}
            style={{
              padding: '8px 16px', borderRadius: 'var(--radius-md)',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
              color: '#f87171', fontSize: '0.85rem',
              fontFamily: 'Outfit, sans-serif', fontWeight: 600,
              cursor: 'pointer', transition: 'var(--transition)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
          >
            🚪 Keluar
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setSearchParams({ tab: tab.key })}
              style={{
                padding: '8px 18px', borderRadius: 'var(--radius-md)',
                fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '0.875rem',
                cursor: 'pointer', transition: 'var(--transition)',
                background: activeTab === tab.key ? 'rgba(124,58,237,0.15)' : 'var(--bg-elevated)',
                border: `1px solid ${activeTab === tab.key ? 'var(--border-accent)' : 'var(--border-card)'}`,
                color: activeTab === tab.key ? 'var(--text-accent)' : 'var(--text-secondary)',
              }}
            >
              {tab.label}
              {!loading && data.length > 0 && activeTab === tab.key && (
                <span style={{
                  marginLeft: '8px', fontSize: '0.7rem',
                  background: 'rgba(124,58,237,0.3)', color: 'var(--text-accent)',
                  padding: '1px 6px', borderRadius: '99px',
                }}>{data.length}</span>
              )}
            </button>
          ))}

          {activeTab === 'history' && data.length > 0 && (
            <button
              onClick={handleClearHistory}
              style={{
                marginLeft: 'auto', padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)',
                color: '#f87171', fontSize: '0.8rem',
                fontFamily: 'Outfit, sans-serif', fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              🗑️ Hapus Semua
            </button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 86, borderRadius: 'var(--radius-md)' }} />
            ))}
          </div>
        ) : data.length === 0 ? (
          <EmptyState
            icon={{ favorites: '❤️', watchlist: '📚', history: '🕐' }[activeTab]}
            title={{
              favorites: 'Belum ada favorit',
              watchlist: 'Watchlist masih kosong',
              history: 'Belum ada riwayat nonton',
            }[activeTab]}
            desc={{
              favorites: 'Tambahkan anime ke favorit dari halaman detail anime.',
              watchlist: 'Simpan anime yang ingin kamu tonton nanti.',
              history: 'Riwayat akan muncul setelah kamu mulai menonton.',
            }[activeTab]}
            link="/"
            linkLabel="Jelajahi Anime"
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {data.map((item, idx) => (
              <AnimeListItem
                key={`${item.id}-${idx}`}
                item={item}
                onRemove={handleRemove}
                removeLabel={{ favorites: 'Hapus', watchlist: 'Hapus', history: 'Hapus' }[activeTab]}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
