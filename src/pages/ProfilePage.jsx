import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites, useWatchlist, useHistory } from '../hooks/useUserData';
import AuthModal from '../components/AuthModal';

/* ── Color palette for charts ─────────────────────────────────────────── */
const CHART_COLORS = ['#f47521','#3b82f6','#2dce89','#f59e0b','#ec4899','#8b5cf6','#14b8a6','#f43f5e'];

/* ── AniList-style stats card ─────────────────────────────────────────── */
function StatCard({ value, label, icon, color = 'var(--accent-primary)' }) {
  return (
    <div className="stat-card" style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{icon}</div>
      <div className="stat-value" style={{ color }}>{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

/* ── Distribution bar chart ───────────────────────────────────────────── */
function DistributionChart({ title, items }) {
  if (!items.length) return null;
  const max = items[0].count;
  return (
    <div>
      <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '0.88rem', marginBottom: '12px', color: 'var(--text-secondary)' }}>
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {items.slice(0, 6).map(({ label, count, color }, i) => (
          <div key={label} className="progress-bar-wrap">
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', width: 90, flexShrink: 0, fontWeight: 500 }}>
              {label}
            </span>
            <div className="progress-bar-track">
              <div
                className="progress-bar-fill"
                style={{ width: `${(count / max) * 100}%`, background: color || CHART_COLORS[i % CHART_COLORS.length] }}
              />
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', width: 24, textAlign: 'right', fontWeight: 700 }}>
              {count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Anime list item ──────────────────────────────────────────────────── */
function AnimeListItem({ item, onRemove }) {
  const [removing, setRemoving] = useState(false);
  const handleRemove = async () => { setRemoving(true); await onRemove(item.id); setRemoving(false); };

  return (
    <div className="profile-list-item" style={{
      display: 'flex', alignItems: 'center', gap: '14px',
      padding: '12px 16px', borderRadius: 'var(--radius-md)',
      background: 'var(--bg-elevated)', border: '1px solid var(--border-card)',
      animation: 'fadeIn 0.3s ease', transition: 'var(--transition)',
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-accent)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-card)'}
    >
      <Link to={`/anime/${item.id}`} style={{ flexShrink: 0 }}>
        {item.cover ? (
          <img src={item.cover} alt={item.title} style={{ width: 42, height: 58, objectFit: 'cover', borderRadius: '7px' }} />
        ) : (
          <div style={{ width: 42, height: 58, borderRadius: '7px', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🎬</div>
        )}
      </Link>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Link to={`/anime/${item.id}`} style={{ textDecoration: 'none' }}>
          <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.title}
          </div>
        </Link>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          {item.type && (
            <span style={{ fontSize: '0.62rem', padding: '2px 8px', borderRadius: '99px', background: 'rgba(244,117,33,0.12)', color: 'var(--accent-primary)', border: '1px solid rgba(244,117,33,0.2)', fontWeight: 700, textTransform: 'uppercase' }}>
              {item.type}
            </span>
          )}
          {item.lastEpisodeNum && (
            <span style={{ fontSize: '0.72rem', color: 'var(--accent-primary)', fontWeight: 700 }}>
              Ep. {item.lastEpisodeNum}
            </span>
          )}
          {item.watchedAt && (
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
              {new Date(item.watchedAt?.seconds * 1000).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
            </span>
          )}
        </div>
      </div>
      <div className="profile-list-item-actions" style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
        {item.lastEpisodeNum && (
          <Link
            to={`/watch/${item.id}/episode/${item.lastEpisodeNum}`}
            className="btn-primary"
            style={{ padding: '6px 12px', fontSize: '0.72rem', textDecoration: 'none' }}
          >
            ▶ Lanjut
          </Link>
        )}
        <button
          onClick={handleRemove} disabled={removing}
          style={{
            padding: '6px 12px', borderRadius: 'var(--radius-sm)',
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)',
            color: '#f87171', fontSize: '0.72rem', cursor: 'pointer', transition: 'var(--transition)',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.18)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
        >
          {removing ? '...' : 'Hapus'}
        </button>
      </div>
    </div>
  );
}

/* ── Empty state ──────────────────────────────────────────────────────── */
function EmptyState({ icon, title, desc, to, toLabel }) {
  return (
    <div style={{ padding: '56px 24px', textAlign: 'center', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-card)' }}>
      <div style={{ fontSize: '3rem', marginBottom: '14px' }}>{icon}</div>
      <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, marginBottom: '8px', fontSize: '1.1rem' }}>{title}</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>{desc}</p>
      {to && <Link to={to} className="btn-primary" style={{ textDecoration: 'none' }}>{toLabel}</Link>}
    </div>
  );
}

const TABS = [
  { key: 'favorites', label: '❤️ Favorit' },
  { key: 'watchlist', label: '📚 Watchlist' },
  { key: 'history',   label: '🕐 Riwayat' },
];

/* ── Banner gradient presets ──────────────────────────────────────────── */
const BANNER_GRADIENTS = [
  'linear-gradient(135deg, #f47521 0%, #ff8c3a 40%, #1a0a00 100%)',
  'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 40%, #0a0a1a 100%)',
  'linear-gradient(135deg, #2dce89 0%, #059669 40%, #001a0e 100%)',
  'linear-gradient(135deg, #8b5cf6 0%, #5b21b6 40%, #0d0a1a 100%)',
];

/* ── Edit Profile Modal ──────────────────────────────────────────── */
function EditProfileModal({ user, updateProfileInfo, changeUserPassword, onClose }) {
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [photoURL, setPhotoURL] = useState(user.photoURL || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [previewURL, setPreviewURL] = useState(user.photoURL || '');

  // Close on Escape
  const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };

  const avatarPresets = [
    { name: 'Default', url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.email || 'user')}` },
    { name: 'Bottts', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Neon' },
    { name: 'Lorelei', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Anime' },
    { name: 'Avataaars', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hero' },
    { name: 'Pixel', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=cyber' },
    { name: 'Identicon', url: 'https://api.dicebear.com/7.x/identicon/svg?seed=retro' },
  ];

  // Handle file pick → convert to base64
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setStatus({ type: 'error', message: 'File harus berupa gambar (JPG, PNG, GIF, dll).' });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setStatus({ type: 'error', message: 'Ukuran file maksimal 2MB.' });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result;
      setPhotoURL(base64);
      setPreviewURL(base64);
      setStatus({ type: '', message: '' });
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarPreset = (url) => {
    setPhotoURL(url);
    setPreviewURL(url);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });
    try {
      if (displayName !== user.displayName || photoURL !== user.photoURL) {
        const res = await updateProfileInfo(displayName, photoURL);
        if (!res.success) throw new Error(res.error);
      }
      if (newPassword) {
        if (newPassword !== confirmPassword) throw new Error('Konfirmasi password tidak cocok.');
        if (newPassword.length < 6) throw new Error('Password baru minimal 6 karakter.');
        const resPass = await changeUserPassword(newPassword);
        if (!resPass.success) throw new Error(resPass.error);
        setNewPassword('');
        setConfirmPassword('');
      }
      setStatus({ type: 'success', message: 'Profil berhasil diperbarui! ✨' });
      setTimeout(() => onClose(), 1400);
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Terjadi kesalahan.' });
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px 13px', borderRadius: 'var(--radius-sm)',
    background: 'var(--bg-card)', border: '1px solid var(--border-card)',
    color: 'var(--text-primary)', fontFamily: 'Outfit', fontSize: '0.88rem',
    outline: 'none', transition: 'var(--transition)',
  };
  const labelStyle = {
    display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px',
  };

  return (
    <div
      onKeyDown={handleKeyDown}
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto',
        background: 'rgba(18,18,22,0.98)', backdropFilter: 'blur(24px)',
        border: '1px solid var(--border-card)',
        borderRadius: 'var(--radius-2xl)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.8)',
        animation: 'scaleIn 0.2s ease',
      }}>
        {/* Modal header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)',
        }}>
          <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.1rem' }}>
            ⚙️ Edit Profil
          </h2>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: '8px',
            background: 'var(--bg-elevated)', border: '1px solid var(--border-card)',
            color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>

        {/* Modal body */}
        <div style={{ padding: '24px' }}>
          {/* Status banner */}
          {status.message && (
            <div style={{
              padding: '10px 14px', borderRadius: '8px', marginBottom: '18px',
              fontSize: '0.83rem', fontFamily: 'Outfit', fontWeight: 600,
              background: status.type === 'success' ? 'rgba(45,206,137,0.12)' : 'rgba(239,68,68,0.12)',
              color: status.type === 'success' ? '#2dce89' : '#f87171',
              border: `1px solid ${status.type === 'success' ? 'rgba(45,206,137,0.2)' : 'rgba(239,68,68,0.2)'}`,
            }}>
              {status.message}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

            {/* Avatar preview + upload */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
              {/* Live preview */}
              <div style={{
                width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
                border: '3px solid var(--accent-primary)',
                boxShadow: '0 0 16px rgba(244,117,33,0.35)',
                background: 'var(--bg-elevated)',
              }}>
                {previewURL ? (
                  <img src={previewURL} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{
                    width: '100%', height: '100%', background: 'var(--accent-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Outfit', fontWeight: 900, fontSize: '1.5rem', color: 'white',
                  }}>
                    {(user.displayName?.[0] || user.email?.[0] || 'U').toUpperCase()}
                  </div>
                )}
              </div>

              {/* Upload button */}
              <div style={{ flex: 1 }}>
                <label style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '9px 14px', borderRadius: 'var(--radius-md)',
                  background: 'rgba(244,117,33,0.08)', border: '1px solid rgba(244,117,33,0.25)',
                  color: 'var(--accent-primary)', fontSize: '0.82rem', fontFamily: 'Outfit', fontWeight: 700,
                  cursor: 'pointer', transition: 'var(--transition)', width: 'fit-content',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(244,117,33,0.16)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(244,117,33,0.08)'}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  Upload Foto
                  <input
                    type="file" accept="image/*" onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </label>
                <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '5px' }}>
                  JPG, PNG, GIF — maks. 2MB
                </p>
              </div>
            </div>

            {/* Avatar presets */}
            <div>
              <div style={labelStyle}>Atau Pilih Avatar Preset</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {avatarPresets.map((av) => {
                  const isSelected = photoURL === av.url;
                  return (
                    <button
                      type="button" key={av.name} onClick={() => handleAvatarPreset(av.url)}
                      title={av.name}
                      style={{
                        width: 42, height: 42, borderRadius: '50%', overflow: 'hidden',
                        border: `2px solid ${isSelected ? 'var(--accent-primary)' : 'rgba(255,255,255,0.08)'}`,
                        boxShadow: isSelected ? '0 0 10px var(--accent-glow)' : 'none',
                        padding: 0, cursor: 'pointer', transition: 'var(--transition)',
                        background: 'var(--bg-card)',
                      }}
                    >
                      <img src={av.url} alt={av.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Display Name */}
            <div>
              <label style={labelStyle}>Nama Tampilan</label>
              <input
                type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
                placeholder="Masukkan nama..." required style={inputStyle}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--border-accent)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--border-card)'}
              />
            </div>

            <hr style={{ border: 'none', borderBottom: '1px solid var(--border-subtle)' }} />

            <div>
              <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '0.85rem', marginBottom: '4px' }}>Ganti Password</div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '12px' }}>Kosongkan jika tidak ingin mengganti.</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Password Baru</label>
                  <input
                    type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                    placeholder="Min. 6 karakter" style={inputStyle}
                    onFocus={e => e.currentTarget.style.borderColor = 'var(--border-accent)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'var(--border-card)'}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Konfirmasi</label>
                  <input
                    type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi" style={inputStyle}
                    onFocus={e => e.currentTarget.style.borderColor = 'var(--border-accent)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'var(--border-card)'}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit" disabled={loading} className="btn-primary"
              style={{ justifyContent: 'center', padding: '12px' }}
            >
              {loading ? (
                <div style={{ width: 18, height: 18, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
              ) : '💾 Simpan Perubahan'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'favorites';
  const { user, isLoggedIn, logout, updateProfileInfo, changeUserPassword } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const { getFavorites, removeFavorite }     = useFavorites();
  const { getWatchlist, removeFromWatchlist } = useWatchlist();
  const { getHistory, clearHistory }          = useHistory();

  const [data, setData]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [allData, setAllData] = useState({ favorites: [], watchlist: [], history: [] });

  // Load all lists once for stats
  useEffect(() => {
    if (!isLoggedIn) { setLoading(false); return; }
    Promise.all([getFavorites(), getWatchlist(), getHistory()])
      .then(([fav, wl, hist]) => {
        const dedup = (arr) => {
          const seen = new Set();
          return arr.filter(i => { if (!i.id || seen.has(i.id)) return false; seen.add(i.id); return true; });
        };
        setAllData({ favorites: dedup(fav || []), watchlist: dedup(wl || []), history: dedup(hist || []) });
      })
      .catch(() => {});
  }, [isLoggedIn]); // eslint-disable-line

  // Load active tab data
  useEffect(() => {
    if (!isLoggedIn) { setLoading(false); return; }
    setLoading(true);
    const fn = { favorites: getFavorites, watchlist: getWatchlist, history: getHistory }[activeTab];
    fn?.().then(res => {
      const items = res || [];
      const seen = new Set();
      const unique = items.filter(i => { if (!i.id || seen.has(i.id)) return false; seen.add(i.id); return true; });
      setData(unique);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [activeTab, isLoggedIn]); // eslint-disable-line

  const handleRemove = async (animeId) => {
    if (activeTab === 'favorites') await removeFavorite(animeId);
    if (activeTab === 'watchlist') await removeFromWatchlist(animeId);
    if (activeTab === 'history')   await clearHistory(animeId);
    setData(prev => prev.filter(i => i.id !== animeId));
    setAllData(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].filter(i => i.id !== animeId),
    }));
  };

  /* ── Derived stats ─────────────────────────────────────────────────── */
  const stats = useMemo(() => {
    const all = [...new Map([...allData.favorites, ...allData.watchlist, ...allData.history].map(i => [i.id, i])).values()];
    const totalAnime   = all.length;
    const totalEp      = allData.history.reduce((s, i) => s + (i.lastEpisodeNum || 1), 0);
    const daysWatched  = ((totalEp * 24) / 1440).toFixed(1);
    const scores       = all.filter(i => i.score).map(i => Number(i.score));
    const meanScore    = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2) : '—';

    // Genre distribution
    const genreMap = {};
    all.forEach(anime => {
      (anime.genres || []).forEach(g => { genreMap[g.name] = (genreMap[g.name] || 0) + 1; });
    });
    const genreDist = Object.entries(genreMap).sort((a, b) => b[1] - a[1]).map(([label, count], i) => ({ label, count, color: CHART_COLORS[i % CHART_COLORS.length] }));

    // Format distribution
    const typeMap = {};
    all.forEach(i => { const t = i.type || 'Unknown'; typeMap[t] = (typeMap[t] || 0) + 1; });
    const typeDist = Object.entries(typeMap).sort((a, b) => b[1] - a[1]).map(([label, count], i) => ({ label, count, color: CHART_COLORS[i % CHART_COLORS.length] }));

    return { totalAnime, totalEp, daysWatched, meanScore, genreDist, typeDist };
  }, [allData]);

  /* ── Not logged in ─────────────────────────────────────────────────── */
  if (!isLoggedIn) {
    return (
      <div style={{ paddingTop: 'var(--navbar-height)' }}>
        <div className="container" style={{ paddingTop: '80px', paddingBottom: '80px', textAlign: 'center' }}>
          <div style={{ fontSize: '4.5rem', marginBottom: '20px' }}>🔐</div>
          <h1 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '2rem', marginBottom: '12px' }}>
            Masuk untuk Melihat Profil
          </h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '28px', maxWidth: '400px', margin: '0 auto 28px' }}>
            Login untuk mengakses favorit, watchlist, riwayat nonton, dan statistik animemu.
          </p>
          <button onClick={() => setAuthOpen(true)} className="btn-primary">Masuk Sekarang</button>
        </div>
        {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
      </div>
    );
  }

  const initials = user.displayName
    ? user.displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : user.email?.[0]?.toUpperCase() || 'U';

  // pick banner based on uid
  const bannerGradient = BANNER_GRADIENTS[(user.uid?.charCodeAt(0) || 0) % BANNER_GRADIENTS.length];

  return (
    <div style={{ paddingTop: 'var(--navbar-height)' }}>

      {/* ── AniList-style Profile Banner ─────────────────────────────── */}
      <div className="container" style={{ paddingTop: '28px', paddingBottom: '72px' }}>

        {/* Banner + avatar header card */}
        <div style={{
          borderRadius: 'var(--radius-2xl)', overflow: 'hidden',
          border: '1px solid var(--border-card)', marginBottom: '24px',
          background: 'var(--bg-elevated)',
        }}>
          {/* Banner */}
          <div className="profile-banner" style={{ height: 180, background: bannerGradient }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.45) 100%)' }} />
            {/* Subtle grid pattern */}
            <div style={{
              position: 'absolute', inset: 0, opacity: 0.06,
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }} />
          </div>

          {/* Avatar + name row */}
          <div className="profile-header-card" style={{
            display: 'flex', alignItems: 'flex-end', gap: '20px',
            padding: '0 24px 24px', marginTop: '-44px', position: 'relative',
            flexWrap: 'wrap',
          }}>
            {/* Avatar */}
            <div className="profile-avatar-ring" style={{ width: 88, height: 88, flexShrink: 0, zIndex: 1 }}>
              {user.photoURL ? (
                <img src={user.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{
                  width: '100%', height: '100%',
                  background: 'var(--accent-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Outfit', fontWeight: 900, fontSize: '2rem', color: 'white',
                }}>{initials}</div>
              )}
            </div>

            {/* Name + email */}
            <div style={{ flex: 1, minWidth: '180px', paddingBottom: '4px' }}>
              <h1 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '1.5rem', marginBottom: '2px' }}>
                {user.displayName || 'Pengguna'}
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{user.email}</p>
            </div>

            {/* Action buttons: Edit Profil + Logout */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button onClick={() => setEditOpen(true)} style={{
                padding: '8px 18px', borderRadius: 'var(--radius-md)',
                background: 'rgba(244,117,33,0.1)', border: '1px solid rgba(244,117,33,0.25)',
                color: 'var(--accent-primary)', fontSize: '0.82rem', fontFamily: 'Outfit', fontWeight: 600,
                cursor: 'pointer', transition: 'var(--transition)',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(244,117,33,0.18)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(244,117,33,0.1)'}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Edit Profil
              </button>
              <button onClick={logout} style={{
                padding: '8px 18px', borderRadius: 'var(--radius-md)',
                background: 'rgba(239,68,68,0.09)', border: '1px solid rgba(239,68,68,0.2)',
                color: '#f87171', fontSize: '0.82rem', fontFamily: 'Outfit', fontWeight: 600,
                cursor: 'pointer', transition: 'var(--transition)',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.18)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.09)'}
              >🚪 Keluar</button>
            </div>
          </div>
        </div>

        {/* ── AniList-style Stats row ─────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px', marginBottom: '28px' }}>
          <StatCard icon="🎬" value={stats.totalAnime} label="Total Anime" />
          <StatCard icon="📺" value={stats.totalEp} label="Episodes" color="#3b82f6" />
          <StatCard icon="⏱️" value={`${stats.daysWatched}d`} label="Waktu Nonton" color="#2dce89" />
          <StatCard icon="⭐" value={stats.meanScore} label="Rata-rata Skor" color="#f59e0b" />
          <StatCard icon="❤️" value={allData.favorites.length} label="Favorit" color="#ec4899" />
          <StatCard icon="📚" value={allData.watchlist.length} label="Watchlist" color="#8b5cf6" />
        </div>

        {/* ── Distribution charts ─────────────────────────────────────── */}
        {(stats.genreDist.length > 0 || stats.typeDist.length > 0) && (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '16px', marginBottom: '28px',
          }}>
            {stats.genreDist.length > 0 && (
              <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-xl)', padding: '20px' }}>
                <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '0.9rem', marginBottom: '16px' }}>📊 Distribusi Genre</h3>
                <DistributionChart items={stats.genreDist} />
              </div>
            )}
            {stats.typeDist.length > 0 && (
              <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-xl)', padding: '20px' }}>
                <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '0.9rem', marginBottom: '16px' }}>🎞️ Distribusi Format</h3>
                <DistributionChart items={stats.typeDist} />
              </div>
            )}
          </div>
        )}

        {/* ── Tabs ───────────────────────────────────────────────────── */}
        <div className="tab-bar profile-tabs" style={{ marginBottom: '20px' }}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`tab-btn${activeTab === tab.key ? ' active' : ''}`}
              onClick={() => setSearchParams({ tab: tab.key })}
            >
              {tab.label}
              {!loading && activeTab === tab.key && data.length > 0 && (
                <span style={{
                  marginLeft: '7px', fontSize: '0.65rem',
                  background: 'rgba(244,117,33,0.25)', color: 'var(--accent-primary)',
                  padding: '1px 6px', borderRadius: '99px',
                }}>{data.length}</span>
              )}
            </button>
          ))}

          {activeTab === 'history' && data.length > 0 && (
            <button
              onClick={async () => { if (!window.confirm('Hapus semua riwayat?')) return; await clearHistory(); setData([]); }}
              style={{
                marginLeft: 'auto', padding: '10px 14px',
                background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)',
                color: '#f87171', fontSize: '0.78rem', fontFamily: 'Outfit', fontWeight: 600,
                borderRadius: 'var(--radius-sm)', cursor: 'pointer',
              }}
            >🗑️ Hapus Semua</button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 84, borderRadius: 'var(--radius-md)' }} />
            ))}
          </div>
        ) : data.length === 0 ? (
          <EmptyState
            icon={{ favorites: '❤️', watchlist: '📚', history: '🕐' }[activeTab]}
            title={{ favorites: 'Belum ada favorit', watchlist: 'Watchlist masih kosong', history: 'Belum ada riwayat' }[activeTab]}
            desc={{ favorites: 'Tambahkan dari halaman detail anime.', watchlist: 'Simpan anime yang ingin ditonton.', history: 'Riwayat muncul setelah kamu mulai menonton.' }[activeTab]}
            to="/" toLabel="Jelajahi Anime"
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {data.map((item, idx) => (
              <AnimeListItem key={`${item.id}-${idx}`} item={item} onRemove={handleRemove} />
            ))}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {editOpen && (
        <EditProfileModal
          user={user}
          updateProfileInfo={updateProfileInfo}
          changeUserPassword={changeUserPassword}
          onClose={() => setEditOpen(false)}
        />
      )}
    </div>
  );
}

