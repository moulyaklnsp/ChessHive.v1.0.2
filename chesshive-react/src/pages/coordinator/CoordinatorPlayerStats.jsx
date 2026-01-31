import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/playerNeoNoir.css';
import { motion } from 'framer-motion';
import usePlayerTheme from '../../hooks/usePlayerTheme';
import AnimatedSidebar from '../../components/AnimatedSidebar';

const sectionVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.12,
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1]
    }
  })
};

function CoordinatorPlayerStats() {
  const [isDark, toggleTheme] = usePlayerTheme();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch('/coordinator/api/player-stats', { credentials: 'include' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch player stats');
        setPlayers(Array.isArray(data.players) ? data.players : []);
      } catch (e) {
        console.error('Error fetching player stats:', e);
        setError('Error fetching player data');
      } finally {
        setLoading(false);
      }
    };
    fetchPlayers();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return players;
    return players.filter((p) => (p.name || '').toLowerCase().includes(q));
  }, [players, query]);

  const totals = useMemo(() => {
    const totalPlayers = players.length;
    const totalGames = players.reduce((sum, p) => sum + (Number(p.gamesPlayed) || 0), 0);
    const avgRating = totalPlayers
      ? Math.round(players.reduce((sum, p) => sum + (Number(p.rating) || 0), 0) / totalPlayers)
      : 0;
    return { totalPlayers, totalGames, avgRating };
  }, [players]);

  const styles = {
    root: { fontFamily: 'Playfair Display, serif', backgroundColor: '#FFFDD0', minHeight: '100vh', padding: '2rem' },
    container: { maxWidth: 1200, margin: '0 auto' },
    h2: { fontFamily: 'Cinzel, serif', fontSize: '2.5rem', color: '#2E8B57', marginBottom: '2rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' },
    card: { background: 'var(--card-bg)', padding: '1.5rem', borderRadius: 10, textAlign: 'center', boxShadow: 'none', border: '1px solid var(--card-border)' },
    statVal: { fontSize: '2rem', fontWeight: 'bold', color: '#2E8B57', marginBottom: '0.5rem' },
    statLbl: { color: '#666', fontFamily: 'Cinzel, serif' },
    tableWrap: { background: 'var(--card-bg)', borderRadius: 15, padding: '2rem', boxShadow: 'none', overflowX: 'auto', border: '1px solid var(--card-border)' },
    searchWrap: { marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' },
    searchInput: { padding: '0.6rem 1rem', width: '100%', maxWidth: 300, border: '2px solid #2E8B57', borderRadius: 8, fontSize: '1rem', fontFamily: 'Playfair Display, serif' },
    table: { width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem' },
    th: { backgroundColor: '#2E8B57', color: '#fff', padding: '1rem', textAlign: 'left', fontFamily: 'Cinzel, serif' },
    td: { padding: '1rem', borderBottom: '1px solid rgba(46,139,87,0.2)' },
    ratingCell: { fontWeight: 'bold', color: '#2E8B57' },
    backRow: { textAlign: 'right', marginTop: '2rem' },
    backLink: { display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#2E8B57', color: '#fff', textDecoration: 'none', padding: '0.8rem 1.5rem', borderRadius: 8, fontFamily: 'Cinzel, serif', fontWeight: 'bold' },
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <style>{`
        * { margin:0; padding:0; box-sizing:border-box; }
        body, #root { min-height: 100vh; }
        .page { font-family: 'Playfair Display', serif; background-color: var(--page-bg); min-height: 100vh; display:flex; color: var(--text-color); }
        .content { flex-grow:1; margin-left:0; padding:2rem; }
        h1 { font-family:'Cinzel', serif; color:var(--sea-green); margin-bottom:2rem; font-size:2.5rem; display:flex; align-items:center; gap:1rem; }
        .updates-section { background:var(--card-bg); border-radius:15px; padding:2rem; margin-bottom:2rem; box-shadow:none; border:1px solid var(--card-border); transition: transform 0.3s ease; }
        .updates-section:hover { transform: translateY(-5px); }
        .stats-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:1.5rem; margin-bottom:2rem; }
        .stat-card { background:var(--card-bg); padding:1.5rem; border-radius:10px; text-align:center; border:1px solid var(--card-border); }
        .stat-value { font-size:2rem; font-weight:bold; color:var(--sea-green); margin-bottom:0.5rem; }
        .stat-label { color:var(--text-color); opacity:0.7; font-family:'Cinzel', serif; }
        .search-input { padding:0.6rem 1rem; width:100%; max-width:300px; border:2px solid var(--sea-green); border-radius:8px; font-size:1rem; font-family:'Playfair Display', serif; background:var(--card-bg); color:var(--text-color); }
        .stats-table { width:100%; border-collapse:collapse; margin-bottom:1.5rem; }
        .stats-table th { background:var(--sea-green); color:var(--on-accent); padding:1rem; text-align:left; font-family:'Cinzel', serif; }
        .stats-table td { padding:1rem; border-bottom:1px solid rgba(var(--sea-green-rgb, 27, 94, 63), 0.2); }
        .rating-cell { font-weight:bold; color:var(--sea-green); }
        .action-btn { display:inline-flex; align-items:center; gap:0.5rem; background:var(--sea-green); color:var(--on-accent); text-decoration:none; padding:0.8rem 1.5rem; border-radius:8px; font-family:'Cinzel', serif; font-weight:bold; }
      `}</style>

      <div className="page player-neo">
        <motion.div
          className="chess-knight-float"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 0.14, scale: 1 }}
          transition={{ delay: 0.9, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 0, fontSize: '2.5rem', color: 'var(--sea-green)' }}
          aria-hidden="true"
        >
          <i className="fas fa-chart-bar" />
        </motion.div>
        
        <AnimatedSidebar links={coordinatorLinks} logo={<i className="fas fa-chess" />} title={`ChessHive`} />

        <div className="coordinator-dash-header" style={{ position: 'fixed', top: 18, right: 18, zIndex: 1001, display: 'flex', gap: '12px', alignItems: 'center' }}>
          <motion.button
            type="button"
            onClick={toggleTheme}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              color: 'var(--text-color)',
              width: 40,
              height: 40,
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '1.1rem'
            }}
          >
            <i className={isDark ? 'fas fa-sun' : 'fas fa-moon'} />
          </motion.button>
        </div>

        <div className="content">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <i className="fas fa-chart-bar" /> Player Statistics
          </motion.h1>

          <div className="stats-grid">
            <motion.div
              className="stat-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <div className="stat-value">{totals.totalPlayers}</div>
              <div className="stat-label">Total Players</div>
            </motion.div>
            <motion.div
              className="stat-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="stat-value">{totals.totalGames}</div>
              <div className="stat-label">Total Games</div>
            </motion.div>
            <motion.div
              className="stat-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div className="stat-value">{totals.avgRating}</div>
              <div className="stat-label">Average Rating</div>
            </motion.div>
          </div>

          <motion.div
            className="updates-section"
            custom={0}
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
          >
            <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by player name..."
                className="search-input"
                aria-label="Search players by name"
              />
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="stats-table">
                <thead>
                  <tr>
                    <th><i className="fas fa-user" /> Player Name</th>
                    <th><i className="fas fa-chess" /> Games Played</th>
                    <th><i className="fas fa-trophy" /> Wins</th>
                    <th><i className="fas fa-times" /> Losses</th>
                    <th><i className="fas fa-handshake" /> Draws</th>
                    <th><i className="fas fa-star" /> Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan={6}>Loading…</td>
                    </tr>
                  )}
                  {!loading && !!error && (
                    <tr>
                      <td style={{ color: 'red', textAlign: 'center' }} colSpan={6}>{error}</td>
                    </tr>
                  )}
                  {!loading && !error && filtered.length === 0 && (
                    <tr>
                      <td style={{ textAlign: 'center' }} colSpan={6}><i className="fas fa-info-circle" /> No player statistics available.</td>
                    </tr>
                  )}
                  {!loading && !error && filtered.map((p, idx) => (
                    <tr key={idx}>
                      <td>{p.name}</td>
                      <td>{p.gamesPlayed}</td>
                      <td>{p.wins}</td>
                      <td>{p.losses}</td>
                      <td>{p.draws}</td>
                      <td className="rating-cell">{p.rating}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ textAlign: 'right', marginTop: '2rem' }}>
              <Link to="/coordinator/coordinator_dashboard" className="action-btn">
                <i className="fas fa-arrow-left" /> Back to Dashboard
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default CoordinatorPlayerStats;
