import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/playerNeoNoir.css';
import { motion } from 'framer-motion';
import usePlayerTheme from '../../hooks/usePlayerTheme';
import AnimatedSidebar from '../../components/AnimatedSidebar';

const PAGE_SIZE = 5;

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

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.12 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
  }
};

function OrganizerDashboard() {
  const navigate = useNavigate();
  const [isDark, toggleTheme] = usePlayerTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);

  const [organizerName, setOrganizerName] = useState('Organizer');
  const [meetings, setMeetings] = useState([]);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const onResize = useCallback(() => {
    const mobile = window.innerWidth <= 768;
    setIsMobile(mobile);
    if (!mobile) setSidebarOpen(true);
  }, []);

  useEffect(() => {
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [onResize]);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/organizer/api/dashboard', { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load dashboard');
      setOrganizerName(data.organizerName || 'Organizer');
      setMeetings(Array.isArray(data.meetings) ? data.meetings : []);
      setVisible(PAGE_SIZE);
    } catch (e) {
      console.error('Dashboard load error:', e);
      setError('Error loading dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const showMeetings = useMemo(() => meetings.slice(0, visible), [meetings, visible]);

  const handleLogout = () => navigate('/login');

  // Organizer-specific nav links used by AnimatedSidebar
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
      {/* Head styles (scoped) */}
      <style>{`
        * { margin:0; padding:0; box-sizing:border-box; }
        body, #root { min-height: 100vh; }
        .page { font-family: 'Playfair Display', serif; background-color: var(--page-bg); min-height: 100vh; display:flex; color: var(--text-color); }
        .content { flex-grow:1; margin-left:0; padding:2rem; }
        h1 { font-family:'Cinzel', serif; color:var(--sea-green); margin-bottom:2rem; font-size:2.5rem; display:flex; align-items:center; gap:1rem; }
        .updates-section { background:var(--card-bg); border-radius:15px; padding:2rem; margin-bottom:2rem; box-shadow:none; border:1px solid var(--card-border); transition: transform 0.3s ease; }
        .updates-section:hover { transform: translateY(-5px); }
        .updates-section h3 { font-family:'Cinzel', serif; color:var(--sea-green); margin-bottom:1.5rem; display:flex; align-items:center; gap:0.8rem; font-size:1.5rem; }
        .updates-section ul { list-style:none; }
        .updates-section li { padding:1rem; border-bottom:1px solid rgba(var(--sea-green-rgb, 27, 94, 63), 0.1); transition:all 0.3s ease; display:flex; align-items:center; gap:1rem; }
        .updates-section li:last-child { border-bottom:none; }
        .updates-section li:hover { background: rgba(var(--sea-green-rgb, 27, 94, 63), 0.1); transform: translateX(5px); border-radius:8px; }
        .meeting-info { flex-grow:1; }
        .join-link { background: linear-gradient(90deg, rgba(235,87,87,1), rgba(6,56,80,1)); color: var(--on-accent); padding:0.5rem 1rem; border-radius:20px; font-size:0.9rem; font-weight:600; box-shadow: inset 0 -4px 12px rgba(0,0,0,0.08); border: 1px solid rgba(0,0,0,0.08); text-decoration:none; display:inline-flex; align-items:center; gap:0.5rem; }
        .date-tag { color:var(--sea-green); font-style: italic; }
        .more-btn{ padding:0.6rem 1rem; border:none; border-radius:8px; cursor:pointer; font-family:'Cinzel', serif; font-weight:bold; transition:all 0.3s ease; display:flex; align-items:center; gap:0.5rem; background-color:var(--sea-green); color:var(--on-accent); }
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
          <i className="fas fa-chess-king" />
        </motion.div>
        
        {/* Site dropdown sidebar (AnimatedSidebar) */}
        <AnimatedSidebar links={organizerLinks} logo={<i className="fas fa-chess" />} title={`ChessHive`} />

        {/* Organizer quick header: theme toggle, welcome */}
        <div className="organizer-dash-header" style={{ position: 'fixed', top: 18, right: 18, zIndex: 1001, display: 'flex', gap: '12px', alignItems: 'center' }}>
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
          <div style={{ color: 'var(--sea-green)', fontWeight: '600' }}>Welcome, {organizerName}</div>
        </div>

        {/* Content */}
        <div className="content chess-dash-checkerboard">
          {error && (
            <div style={{ background: '#ffdddd', color: '#cc0000', padding: '1rem', borderRadius: 8, marginBottom: '1rem' }}>
              <strong>Error loading data:</strong> <span>{error}</span>
            </div>
          )}

          <motion.div
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="chess-piece-icon-wrap"
              >
                <i className="fas fa-chess-king chess-king-glow chess-piece-breathe" aria-hidden="true" />
              </motion.span>
              Welcome to ChessHive, {organizerName}!
            </h1>
            <div />
          </motion.div>

          {/* Upcoming Meetings */}
          <motion.div
            className="updates-section chess-capture-hover chess-card-magic"
            custom={0}
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ y: -4, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } }}
            style={{ willChange: 'transform' }}
          >
            <h3>
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                style={{ display: 'inline-flex', marginRight: '0.5rem' }}
              >
                <i className="fas fa-calendar chess-piece-breathe" style={{ animationDelay: '0s' }} />
              </motion.span>
              Upcoming Meetings (Next 3 Days)
            </h3>
            <motion.ul variants={listVariants} initial="hidden" animate="visible">
              {loading ? (
                <motion.li variants={itemVariants}><i className="fas fa-spinner fa-spin" /> Loading meetings...</motion.li>
              ) : error ? (
                <motion.li variants={itemVariants} style={{ color: 'crimson' }}><i className="fas fa-exclamation-triangle" /> {error}</motion.li>
              ) : meetings.length === 0 ? (
                <motion.li variants={itemVariants}><i className="fas fa-info-circle" /> No upcoming meetings.</motion.li>
              ) : (
                showMeetings.map((m, idx) => (
                  <motion.li key={`${m.title}-${m.date}-${idx}`} custom={idx} variants={itemVariants}>
                    <motion.span
                      className="piece-icon"
                      initial={{ opacity: 0, scale: 0.88 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      style={{ display: 'inline-flex' }}
                    >
                      <i className="fas fa-video" />
                    </motion.span>
                    <div className="meeting-info">
                      <strong>{m.title}</strong><br />
                      <div className="date-tag">
                        <i className="fas fa-calendar-alt" /> {new Date(m.date).toLocaleDateString()} at {m.time}
                      </div>
                    </div>
                    <a href={m.link} target="_blank" rel="noreferrer" className="join-link">
                      <i className="fas fa-video" /> Join
                    </a>
                  </motion.li>
                ))
              )}
            </motion.ul>
            
            {meetings.length > 5 && (
              <div style={{ textAlign: 'center', margin: '1rem 0', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                {visible < meetings.length && (
                  <button type="button" className="more-btn" onClick={() => setVisible((v) => Math.min(v + PAGE_SIZE, meetings.length))}>
                    <i className="fas fa-chevron-down" /> More
                  </button>
                )}
                {visible > PAGE_SIZE && (
                  <button type="button" className="more-btn" onClick={() => setVisible(PAGE_SIZE)}>
                    <i className="fas fa-chevron-up" /> Hide
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default OrganizerDashboard;
