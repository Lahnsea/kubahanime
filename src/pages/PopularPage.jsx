import { Link } from 'react-router-dom';
import AnimeCard, { AnimeCardSkeleton } from '../components/AnimeCard';
import { usePopularAnime } from '../hooks/useAnime';

export default function PopularPage() {
  const { data, loading, loadMore } = usePopularAnime(24);

  return (
    <div style={{ paddingTop: 'var(--navbar-height)' }}>
      <div className="container" style={{ paddingTop: '40px', paddingBottom: '64px' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Link to="/" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none' }}>Home</Link>
            <span style={{ color: 'var(--text-muted)' }}>›</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Populer</span>
          </div>
          <h1 style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 800,
            fontSize: '2rem',
            marginBottom: '8px',
          }}>
            <span className="gradient-text">Anime Terpopuler</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Daftar anime terpopuler sepanjang masa dengan rating tertinggi global
          </p>
        </div>

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}>
          {loading && data.length === 0
            ? Array.from({ length: 24 }).map((_, i) => <AnimeCardSkeleton key={i} />)
            : data.map((anime, i) => <AnimeCard key={`pop-${anime.mal_id}-${i}`} anime={anime} index={i} />)
          }
        </div>

        {/* Load more */}
        {!loading && (
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={loadMore}
              className="btn-secondary"
            >
              Muat Lebih Banyak
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
