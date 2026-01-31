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

function CollegeStats() {
  const [isDark, toggleTheme] = usePlayerTheme();
  const [stats, setStats] = useState({ collegePerformance: [], tournamentRecords: [], topCollegesByFormat: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Simple local filters for a better UX (optional enhancement)
  const [perfQuery, setPerfQuery] = useState('');
  const [recordsQuery, setRecordsQuery] = useState('');
  const [recordsFormat, setRecordsFormat] = useState('all');

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/organizer/api/college-stats', { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch college stats');
      setStats({
        collegePerformance: Array.isArray(data.collegePerformance) ? data.collegePerformance : [],
        tournamentRecords: Array.isArray(data.tournamentRecords) ? data.tournamentRecords : [],
        topCollegesByFormat: data.topCollegesByFormat || {}
      });
    } catch (e) {
      console.error('Fetch college stats error:', e);
      setError('Error fetching college stats.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const filteredPerformance = useMemo(() => {
    const q = perfQuery.trim().toLowerCase();
    if (!q) return stats.collegePerformance;
    return stats.collegePerformance.filter((r) => (r.college || '').toLowerCase().includes(q));
  }, [stats.collegePerformance, perfQuery]);

  const filteredRecords = useMemo(() => {
    const q = recordsQuery.trim().toLowerCase();
    return stats.tournamentRecords.filter((r) => {
      const matchesText = !q || (r.name || '').toLowerCase().includes(q) || (r.college || '').toLowerCase().includes(q);
      const matchesFormat = recordsFormat === 'all' || (r.format || '').toLowerCase() === recordsFormat;
      return matchesText && matchesFormat;
    });
  }, [stats.tournamentRecords, recordsQuery, recordsFormat]);

  const organizerLinks = [
    { path: '/organizer/organizer_profile', label: 'Profile', icon: 'fas fa-user' },
    { path: '/organizer/coordinator_management', label: 'Manage Coordinators', icon: 'fas fa-users-cog' },
    { path: '/organizer/organizer_tournament', label: 'Tournament Oversight', icon: 'fas fa-trophy' },
    { path: '/organizer/college_stats', label: 'College Performance Stats', icon: 'fas fa-chart-bar' },
    { path: '/organizer/store_monitoring', label: 'Store Monitoring', icon: 'fas fa-store' },
    { path: '/organizer/meetings', label: 'Schedule Meetings', icon: 'fas fa-calendar-alt' }
  ];

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
        .updates-section h3 { font-family:'Cinzel', serif; color:var(--sea-green); margin-bottom:1.5rem; display:flex; align-items:center; gap:0.8rem; font-size:1.5rem; }
        .table { width:100%; border-collapse:collapse; margin-bottom:1rem; }
        .th { background:var(--sea-green); color:var(--on-accent); padding:1rem; text-align:left; font-family:'Cinzel', serif; }
        .td { padding:1rem; border-bottom:1px solid rgba(var(--sea-green-rgb, 27, 94, 63), 0.2); }
        .search-row { display:flex; align-items:center; gap:10px; padding:10px; background:var(--card-bg); border-radius:10px; box-shadow:0 2px 6px rgba(0,0,0,0.1); max-width:500px; margin:0 auto 20px; border:1px solid var(--card-border); }
        .input { flex:1; padding:10px 14px; border-radius:8px; border:1px solid var(--card-border); font-size:16px; background:var(--page-bg); color:var(--text-color); min-width:300px; }
        .select { padding:8px 12px; border-radius:8px; border:1px solid var(--card-border); font-size:14px; background:var(--page-bg); color:var(--text-color); }
        .empty { text-align:center; padding:2rem; color:var(--sea-green); font-style:italic; }
        .back-link { display:inline-flex; align-items:center; gap:0.5rem; background:var(--sea-green); color:var(--on-accent); text-decoration:none; padding:0.8rem 1.5rem; border-radius:8px; font-family:'Cinzel', serif; font-weight:bold; }
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
          <i className="fas fa-chart-line" />
        </motion.div>
        
        <AnimatedSidebar links={organizerLinks} logo={<i className="fas fa-chess" />} title={`ChessHive`} />

        <div className="organizer-dash-header" style={{ position: 'fixed', top: 18, right: 18, zIndex: 1001, display: 'flex', gap: '12px', alignItems: 'center' }}>
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
            <i className="fas fa-chart-line" /> College Chess Statistics
          </motion.h1>

          {/* Overall Performance */}
          <motion.div
            className="updates-section"
            custom={0}
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
          >
            <h3><i className="fas fa-chart-line" /> Overall Performance</h3>
            <div className="search-row">
              <input className="input" placeholder="Search college…" value={perfQuery} onChange={(e) => setPerfQuery(e.target.value)} />
            </div>

            {loading && <div>Loading statistics…</div>}
            {!loading && !!error && <div className="empty"><i className="fas fa-info-circle" /> {error}</div>}
            {!loading && !error && (
              <table className="table">
                <thead>
                  <tr>
                    <th className="th"><i className="fas fa-university" /> College</th>
                    <th className="th"><i className="fas fa-trophy" /> Total Tournaments</th>
                    <th className="th"><i className="fas fa-medal" /> Wins</th>
                    <th className="th"><i className="fas fa-award" /> Runner-Ups</th>
                    <th className="th"><i className="fas fa-star" /> Top-5 Finishes</th>
                    <th className="th"><i className="fas fa-percentage" /> Win Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPerformance.length === 0 && (
                    <tr>
                      <td className="td" colSpan={6}>
                        <div className="empty"><i className="fas fa-info-circle" /> No colleges match your search.</div>
                      </td>
                    </tr>
                  )}
                  {filteredPerformance.map((r, idx) => (
                    <tr key={(r.college || idx) + ''}>
                      <td className="td">{r.college}</td>
                      <td className="td">{r.tournaments}</td>
                      <td className="td">{r.wins}</td>
                      <td className="td">{r.losses}</td>
                      <td className="td">{r.draws}</td>
                      <td className="td">{r && r.tournaments ? (((r.wins || 0) / r.tournaments) * 100).toFixed(1) : '0.0'}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </motion.div>

          {/* Tournament Records */}
          <motion.div
            className="updates-section"
            custom={1}
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
          >
            <h3><i className="fas fa-chess" /> Tournament Records</h3>
            <div className="search-row">
              <select className="select" value={recordsFormat} onChange={(e) => setRecordsFormat(e.target.value)}>
                <option value="all">All formats</option>
                <option value="classical">Classical</option>
                <option value="rapid">Rapid</option>
                <option value="blitz">Blitz</option>
              </select>
              <input className="input" placeholder="Search tournament or college…" value={recordsQuery} onChange={(e) => setRecordsQuery(e.target.value)} />
            </div>

            {loading && <div>Loading records…</div>}
            {!loading && !!error && <div className="empty"><i className="fas fa-info-circle" /> {error}</div>}
            {!loading && !error && (
              <table className="table">
                <thead>
                  <tr>
                    <th className="th"><i className="fas fa-trophy" /> Tournament Name</th>
                    <th className="th"><i className="fas fa-university" /> College</th>
                    <th className="th"><i className="fas fa-chess-board" /> Format</th>
                    <th className="th"><i className="fas fa-medal" /> Position</th>
                    <th className="th"><i className="fas fa-calendar" /> Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.length === 0 && (
                    <tr>
                      <td className="td" colSpan={5}>
                        <div className="empty"><i className="fas fa-info-circle" /> No records match your filters.</div>
                      </td>
                    </tr>
                  )}
                  {filteredRecords.map((r, idx) => (
                    <tr key={(r._id || idx) + ''}>
                      <td className="td">{r.name}</td>
                      <td className="td">{r.college}</td>
                      <td className="td">{r.format}</td>
                      <td className="td">{r.position}</td>
                      <td className="td">{r.date ? new Date(r.date).toLocaleDateString() : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </motion.div>

          {/* Top 3 Colleges by Format */}
          <motion.div
            className="updates-section"
            custom={2}
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
          >
            <h3><i className="fas fa-crown" /> Top 3 Colleges by Format</h3>
            {loading && <div>Loading top colleges…</div>}
            {!loading && !!error && <div className="empty"><i className="fas fa-info-circle" /> {error}</div>}
            {!loading && !error && (
              <div>
                {['classical', 'rapid', 'blitz'].map((format) => (
                  <div key={format} style={{ background: 'var(--card-bg)', padding: '1rem 1rem 0.5rem', borderRadius: 12, marginBottom: '1rem', border: '1px solid var(--card-border)' }}>
                    <h3 style={{ fontFamily: 'Cinzel, serif', color: 'var(--sea-green)', marginBottom: '0.5rem', fontSize: '1.2rem' }}>{format.charAt(0).toUpperCase() + format.slice(1)}</h3>
                    <ol style={{ listStylePosition: 'inside', padding: 0 }}>
                      {(stats.topCollegesByFormat?.[format] || []).map((college, index) => (
                        <li key={college + index} style={{ padding: '0.8rem', borderBottom: '1px solid rgba(var(--sea-green-rgb, 27, 94, 63), 0.2)' }} className={index < 3 ? 'top-three' : ''}>
                          <span style={{ fontWeight: index < 3 ? 'bold' : 'normal' }}>{index < 3 ? '🏆 ' : ''}{college}</span>
                        </li>
                      ))}
                      {(stats.topCollegesByFormat?.[format] || []).length === 0 && (
                        <li style={{ padding: '0.8rem' }}>No data.</li>
                      )}
                    </ol>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          <div style={{ textAlign: 'right', marginTop: '2rem' }}>
            <Link to="/organizer/organizer_dashboard" className="back-link">
              <i className="fas fa-arrow-left" /> Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CollegeStats;
