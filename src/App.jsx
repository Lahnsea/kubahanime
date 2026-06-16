import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import AnimeDetailPage from './pages/AnimeDetailPage';
import WatchPage from './pages/WatchPage';
import PopularPage from './pages/PopularPage';
import LatestPage from './pages/LatestPage';
import ProfilePage from './pages/ProfilePage';
import SearchPage from './pages/SearchPage';
import GenrePage from './pages/GenrePage';

function Layout({ children }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <BrowserRouter>
          <Routes>
            {/* Watch Player — no Navbar */}
            <Route
              path="/watch/:id/episode/:episodeNum"
              element={<WatchPage />}
            />

            {/* All pages with Navbar */}
            <Route
              path="/*"
              element={
                <Layout>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/anime/:id" element={<AnimeDetailPage />} />
                    <Route path="/popular" element={<PopularPage />} />
                    <Route path="/latest" element={<LatestPage />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/genre" element={<GenrePage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Layout>
              }
            />
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </AuthProvider>
  );
}

function NotFound() {
  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: '16px', textAlign: 'center', padding: '24px',
    }}>
      <div style={{
        fontSize: '5rem', fontFamily: 'Outfit, sans-serif', fontWeight: 800,
        background: 'var(--gradient-accent)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }}>404</div>
      <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 700 }}>
        Halaman tidak ditemukan
      </h1>
      <p style={{ color: 'var(--text-muted)' }}>Sepertinya halaman ini tidak ada.</p>
      <a href="/" className="btn-primary" style={{ textDecoration: 'none' }}>
        Kembali ke Beranda
      </a>
    </div>
  );
}
