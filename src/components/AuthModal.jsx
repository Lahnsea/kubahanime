import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function AuthModal({ onClose }) {
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const { signInWithGoogle, loginWithEmail, registerWithEmail, error: authError } = useAuth();

  const displayError = localError || authError;

  async function handleGoogle() {
    setLoading(true);
    setLocalError('');
    const res = await signInWithGoogle();
    if (res.success) onClose();
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLocalError('');

    if (!email || !password) {
      setLocalError('Email dan password wajib diisi.');
      return;
    }
    if (tab === 'register' && !name.trim()) {
      setLocalError('Nama wajib diisi.');
      return;
    }
    if (password.length < 6) {
      setLocalError('Password minimal 6 karakter.');
      return;
    }

    setLoading(true);
    const res = tab === 'login'
      ? await loginWithEmail(email, password)
      : await registerWithEmail(email, password, name.trim());

    if (res.success) {
      onClose();
    }
    setLoading(false);
  }

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div style={{
        width: '100%', maxWidth: 420,
        background: 'var(--bg-surface)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-card)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(244,117,33,0.12)',
        overflow: 'hidden',
        animation: 'fadeIn 0.25s ease',
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 24px 0',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px',
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: '7px',
                background: 'var(--gradient-accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8rem', fontWeight: 800, color: 'white',
              }}>K</div>
              <span style={{
                fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1rem',
                background: 'var(--gradient-accent)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>Kubahanime</span>
            </div>
            <h2 style={{
              fontFamily: 'Outfit, sans-serif', fontWeight: 800,
              fontSize: '1.4rem', color: 'var(--text-primary)',
            }}>
              {tab === 'login' ? 'Masuk ke Akun' : 'Buat Akun Baru'}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: '8px',
              background: 'var(--bg-elevated)', border: '1px solid var(--border-card)',
              color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >✕</button>
        </div>

        {/* Tab Switch */}
        <div style={{ padding: '16px 24px 0', display: 'flex', gap: '4px' }}>
          {[
            { key: 'login', label: 'Masuk' },
            { key: 'register', label: 'Daftar' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setLocalError(''); }}
              style={{
                flex: 1, padding: '8px',
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 600, fontSize: '0.875rem',
                cursor: 'pointer', transition: 'var(--transition)',
                background: tab === t.key ? 'var(--bg-elevated)' : 'transparent',
                border: tab === t.key ? '1px solid var(--border-accent)' : '1px solid transparent',
                color: tab === t.key ? 'var(--accent-primary)' : 'var(--text-muted)',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ padding: '20px 24px 24px' }}>
          {/* Google Button */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            style={{
              width: '100%', padding: '11px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-card)',
              color: 'var(--text-primary)',
              fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '0.9rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              transition: 'var(--transition)', opacity: loading ? 0.7 : 1,
              marginBottom: '16px',
            }}
            onMouseEnter={e => !loading && (e.currentTarget.style.borderColor = 'var(--border-accent)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-card)')}
          >
            {/* Google SVG Icon */}
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loading ? 'Memproses...' : 'Lanjutkan dengan Google'}
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>atau</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {tab === 'register' && (
              <div style={{ marginBottom: '12px' }}>
                <label style={labelStyle}>Nama</label>
                <input
                  type="text"
                  placeholder="Nama kamu"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--accent-primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-card)'}
                />
              </div>
            )}

            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--accent-primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-card)'}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder={tab === 'register' ? 'Minimal 6 karakter' : 'Password kamu'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ ...inputStyle, paddingRight: '44px' }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent-primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-card)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
                    fontSize: '0.8rem',
                  }}
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Error */}
            {displayError && (
              <div style={{
                padding: '10px 14px', borderRadius: 'var(--radius-sm)',
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.25)',
                color: '#f87171', fontSize: '0.8rem',
                marginBottom: '16px',
              }}>
                ⚠️ {displayError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{
                width: '100%', justifyContent: 'center',
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    width: 16, height: 16,
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white',
                    borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite',
                    display: 'inline-block',
                  }} />
                  Memproses...
                </span>
              ) : (
                tab === 'login' ? 'Masuk' : 'Buat Akun'
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {tab === 'login'
              ? <>Belum punya akun? <button onClick={() => setTab('register')} style={{ background: 'none', border: 'none', color: 'var(--text-accent)', cursor: 'pointer', fontWeight: 600 }}>Daftar sekarang</button></>
              : <>Sudah punya akun? <button onClick={() => setTab('login')} style={{ background: 'none', border: 'none', color: 'var(--text-accent)', cursor: 'pointer', fontWeight: 600 }}>Masuk</button></>
            }
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const labelStyle = {
  display: 'block',
  fontSize: '0.8rem',
  fontWeight: 600,
  color: 'var(--text-secondary)',
  marginBottom: '6px',
};

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 'var(--radius-sm)',
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border-card)',
  color: 'var(--text-primary)',
  fontSize: '0.9rem',
  fontFamily: 'inherit',
  outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box',
};
