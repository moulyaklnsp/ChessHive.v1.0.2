import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchAsAdmin } from '../../utils/fetchWithRole';
import '../../styles/playerNeoNoir.css';
import { motion } from 'framer-motion';
import usePlayerTheme from '../../hooks/usePlayerTheme';
import AnimatedSidebar from '../../components/AnimatedSidebar';

const AdminPayments = () => {
  const [isDark, toggleTheme] = usePlayerTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [players, setPlayers] = useState([]);
  const [sales, setSales] = useState([]);
  const [tournamentSales, setTournamentSales] = useState([]);

  // per-section visible counts (More/Hide style)
  const [visSubs, setVisSubs] = useState(5);
  const [visSales, setVisSales] = useState(5);
  const [visTour, setVisTour] = useState(5);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchAsAdmin('/admin/api/payments', { cache: 'no-cache' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setPlayers(Array.isArray(data?.players) ? data.players : []);
      setSales(Array.isArray(data?.sales) ? data.sales : []);
      setTournamentSales(Array.isArray(data?.tournamentSales) ? data.tournamentSales : []);
      setVisSubs(5); setVisSales(5); setVisTour(5);
    } catch (e) {
      setError('Failed to load payments data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const totals = useMemo(() => {
    const totalRevenue = sales.reduce((acc, s) => acc + parseFloat(s.price || 0), 0);
    const tourEnrollments = tournamentSales.reduce((acc, t) => acc + (t.total_enrollments || 0), 0);
    const tourRevenue = tournamentSales.reduce((acc, t) => acc + parseFloat(t.revenue || 0), 0);
    return { totalSales: sales.length, totalRevenue, tourEnrollments, tourRevenue };
  }, [sales, tournamentSales]);

  const adminLinks = [
    { path: '/admin/organizer_management', label: 'Manage Organizers', icon: 'fas fa-users-cog' },
    { path: '/admin/coordinator_management', label: 'Manage Coordinators', icon: 'fas fa-user-tie' },
    { path: '/admin/player_management', label: 'Manage Players', icon: 'fas fa-user-tie' },
    { path: '/admin/admin_tournament_management', label: 'Tournament Approvals', icon: 'fas fa-trophy' },
    { path: '/admin/payments', label: 'Payments & Subscriptions', icon: 'fas fa-money-bill-wave' }
  ];

  // Remove the old styles object since we're using CSS classes now
  // slices for display
  const subsShown = players.slice(0, visSubs);
  const salesShown = sales.slice(0, visSales);
  const tourShown = tournamentSales.slice(0, visTour);

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Head styles (scoped) */}
      <style>{`
        * { margin:0; padding:0; box-sizing:border-box; }
        body, #root { min-height: 100vh; }
        .page { font-family: 'Playfair Display', serif; background-color: var(--page-bg); min-height: 100vh; display:flex; color: var(--text-color); }
        .content { flex-grow:1; margin-left:0; padding:2rem; }
        h1, h2 { font-family:'Cinzel', serif; color:var(--sea-green); margin-bottom:2rem; font-size:2.5rem; display:flex; align-items:center; gap:1rem; }
        h2 { font-size:2.2rem; justify-content:center; }
        .updates-section { background:var(--card-bg); border-radius:15px; padding:2rem; margin-bottom:2rem; box-shadow:none; border:1px solid var(--card-border); transition: transform 0.3s ease; overflow-x:auto; }
        .updates-section:hover { transform: translateY(-5px); }
        .table { width:100%; border-collapse:collapse; margin-bottom:2rem; }
        .th { background:var(--sea-green); color:var(--on-accent); padding:1.2rem; text-align:left; font-family:'Cinzel', serif; font-size:1.1rem; }
        .td { padding:1rem; border-bottom:1px solid rgba(var(--sea-green-rgb, 27, 94, 63), 0.2); }
        .status-badge { padding:0.5rem 1rem; border-radius:20px; font-size:0.9rem; font-weight:bold; display:inline-block; text-align:center; background-color:var(--sky-blue); color:var(--sea-green); }
        .more-btn { display:inline-flex; align-items:center; gap:0.5rem; background-color:var(--sea-green); color:var(--on-accent); text-decoration:none; padding:0.8rem 1.5rem; border-radius:8px; transition:all 0.3s ease; font-family:'Cinzel', serif; font-weight:bold; cursor:pointer; border:none; }
        .row-counter { text-align:center; margin-bottom:1rem; font-family:'Cinzel', serif; font-size:1.2rem; color:var(--sea-green); background-color:rgba(var(--sea-green-rgb, 27, 94, 63), 0.1); padding:0.5rem 1rem; border-radius:8px; display:inline-block; }
        .empty { text-align:center; padding:2rem; color:var(--sea-green); font-style:italic; }
        .banner { padding:1rem; border-radius:8px; margin-bottom:1rem; text-align:center; font-weight:bold; }
        .banner.error { background:rgba(220,53,69,0.1); color:#dc3545; }
        .back-link { display:inline-flex; align-items:center; gap:0.5rem; background-color:var(--sea-green); color:var(--on-accent); text-decoration:none; padding:0.8rem 1.5rem; border-radius:8px; transition:all 0.3s ease; font-family:'Cinzel', serif; font-weight:bold; }
        .stats { display:grid; grid-template-columns:repeat(auto-fit, minmax(200px,1fr)); gap:1.5rem; margin-bottom:1.5rem; }
        .stat-card { background:var(--card-bg); padding:1.5rem; border-radius:10px; text-align:center; box-shadow:none; border:1px solid var(--card-border); }
        .stat-value { font-size:1.6rem; font-weight:bold; color:var(--sea-green); margin-bottom:.5rem; }
        .stat-label { color:var(--text-color); opacity:0.7; font-size:.9rem; }
      `}</style>

      <div className="page player-neo">
        {/* Decorative floating chess piece */}
        <motion.div
          className="chess-knight-float"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 0.14, scale: 1 }}
          transition={{ delay: 0.9, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 0, fontSize: '2.5rem', color: 'var(--sea-green)' }}
          aria-hidden="true"
        >
          <i className="fas fa-money-bill-wave" />
        </motion.div>
        
        {/* Site dropdown sidebar (AnimatedSidebar) */}
        <AnimatedSidebar links={adminLinks} logo={<i className="fas fa-chess" />} title={`ChessHive`} />

        {/* Admin quick header: theme toggle */}
        <div className="admin-dash-header" style={{ position: 'fixed', top: 18, right: 18, zIndex: 1001, display: 'flex', gap: '12px', alignItems: 'center' }}>
          <motion.button
            type="button"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
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
            <i className={isDark ? 'fas fa-sun' : 'fas fa-moon'} aria-hidden="true" />
          </motion.button>
        </div>

        {/* Content */}
        <div className="content">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <i className="fas fa-money-bill-wave" /> Payments & Subscriptions
          </motion.h2>

          {error && <div className="banner error">{error}</div>}

          {/* Subscriptions */}
          <motion.div
            className="updates-section"
            initial={{ opacity: 0, y: 28, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <h4 style={{ color: 'var(--sea-green)', fontSize: '1.2rem', marginBottom: '1.5rem', fontFamily: 'Cinzel, serif' }}>
              <i className="fas fa-crown" /> Player Subscriptions
            </h4>
            <div style={{ textAlign: 'center' }}>
              <span className="row-counter">{`${Math.min(visSubs, players.length)} / ${players.length}`}</span>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th className="th"><i className="fas fa-user" /> Player Name</th>
                  <th className="th"><i className="fas fa-crown" /> Subscription Level</th>
                  <th className="th"><i className="fas fa-calendar" /> Date of Subscription</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={3} className="empty"><i className="fas fa-info-circle" /> Loading subscriptions…</td></tr>
                ) : subsShown.length === 0 ? (
                  <tr><td colSpan={3} className="empty"><i className="fas fa-info-circle" /> No players available.</td></tr>
                ) : (
                  subsShown.map((p, idx) => (
                    <tr key={`${p.email || p.name || 'sub'}-${idx}`}>
                      <td className="td">{p.name || 'N/A'}</td>
                      <td className="td"><span className="status-badge">Level {p.plan || 'Unknown'}</span></td>
                      <td className="td">{p.start_date ? new Date(p.start_date).toLocaleDateString() : 'N/A'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div style={{ textAlign: 'center', margin: '1rem 0', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              {players.length > visSubs && (
                <button type="button" className="more-btn" onClick={() => setVisSubs((v) => Math.min(v + 5, players.length))}>
                  <i className="fas fa-chevron-down" /> More
                </button>
              )}
              {visSubs > 5 && (
                <button type="button" className="more-btn" onClick={() => setVisSubs(5)}>
                  <i className="fas fa-chevron-up" /> Hide
                </button>
              )}
            </div>
          </motion.div>

          {/* Sales Report */}
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <i className="fas fa-chart-line" /> Sales Report
          </motion.h2>
          <div className="stats">
            <div className="stat-card">
              <div className="stat-value">{totals.totalSales}</div>
              <div className="stat-label">Total Sales</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">₹{totals.totalRevenue.toFixed(2)}</div>
              <div className="stat-label">Total Revenue</div>
            </div>
          </div>
          <motion.div
            className="updates-section"
            initial={{ opacity: 0, y: 28, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <div style={{ textAlign: 'center' }}>
              <span className="row-counter">{`${Math.min(visSales, sales.length)} / ${sales.length}`}</span>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th className="th">Product</th>
                  <th className="th">Price</th>
                  <th className="th">Coordinator</th>
                  <th className="th">Buyer</th>
                  <th className="th">College</th>
                  <th className="th">Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="empty"><i className="fas fa-info-circle" /> Loading sales…</td></tr>
                ) : salesShown.length === 0 ? (
                  <tr><td colSpan={6} className="empty"><i className="fas fa-info-circle" /> No sales recorded.</td></tr>
                ) : (
                  salesShown.map((s, idx) => (
                    <tr key={`${s.product || 'sale'}-${idx}`}>
                      <td className="td">{s.product || 'N/A'}</td>
                      <td className="td">₹{s.price || 0}</td>
                      <td className="td">{s.coordinator || 'N/A'}</td>
                      <td className="td">{s.buyer || 'N/A'}</td>
                      <td className="td">{s.college || 'N/A'}</td>
                      <td className="td">{s.purchase_date ? new Date(s.purchase_date).toLocaleDateString() : 'N/A'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div style={{ textAlign: 'center', margin: '1rem 0', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              {sales.length > visSales && (
                <button type="button" className="more-btn" onClick={() => setVisSales((v) => Math.min(v + 5, sales.length))}>
                  <i className="fas fa-chevron-down" /> More
                </button>
              )}
              {visSales > 5 && (
                <button type="button" className="more-btn" onClick={() => setVisSales(5)}>
                  <i className="fas fa-chevron-up" /> Hide
                </button>
              )}
            </div>
          </motion.div>

          {/* Tournament Sales */}
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <i className="fas fa-trophy" /> Tournament Sales Report
          </motion.h2>
          <div className="stats">
            <div className="stat-card">
              <div className="stat-value">{totals.tourEnrollments}</div>
              <div className="stat-label">Total Tournament Enrollments</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">₹{totals.tourRevenue.toFixed(2)}</div>
              <div className="stat-label">Total Tournament Revenue</div>
            </div>
          </div>
          <motion.div
            className="updates-section"
            initial={{ opacity: 0, y: 28, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <div style={{ textAlign: 'center' }}>
              <span className="row-counter">{`${Math.min(visTour, tournamentSales.length)} / ${tournamentSales.length}`}</span>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th className="th">Tournament</th>
                  <th className="th">Entry Fee</th>
                  <th className="th">Total Players/Teams</th>
                  <th className="th">Revenue</th>
                  <th className="th">Enrollment Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="empty"><i className="fas fa-info-circle" /> Loading tournament sales…</td></tr>
                ) : tourShown.length === 0 ? (
                  <tr><td colSpan={5} className="empty"><i className="fas fa-info-circle" /> No tournament enrollments recorded.</td></tr>
                ) : (
                  tourShown.map((t, idx) => (
                    <tr key={`${t.name || 'tourn'}-${idx}`}>
                      <td className="td">{t.name || 'N/A'}</td>
                      <td className="td">₹{t.entry_fee || 0}</td>
                      <td className="td">{t.total_enrollments || 0} {t.type === 'Individual' ? 'Players' : 'Teams'}</td>
                      <td className="td">₹{(t.revenue || 0).toFixed(2)}</td>
                      <td className="td">{t.enrollment_date ? new Date(t.enrollment_date).toLocaleDateString() : 'N/A'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div style={{ textAlign: 'center', margin: '1rem 0', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              {tournamentSales.length > visTour && (
                <button type="button" className="more-btn" onClick={() => setVisTour((v) => Math.min(v + 5, tournamentSales.length))}>
                  <i className="fas fa-chevron-down" /> More
                </button>
              )}
              {visTour > 5 && (
                <button type="button" className="more-btn" onClick={() => setVisTour(5)}>
                  <i className="fas fa-chevron-up" /> Hide
                </button>
              )}
            </div>
            <div style={{ marginTop: '2rem', textAlign: 'right' }}>
              <Link to="/admin/admin_dashboard" className="back-link">
                <i className="fas fa-arrow-left" /> Back to Dashboard
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminPayments;
