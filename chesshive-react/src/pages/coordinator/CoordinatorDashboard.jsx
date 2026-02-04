import React, { useEffect, useMemo, useState, useCallback } from 'react';
import '../../styles/playerNeoNoir.css';
import { motion } from 'framer-motion';
import { fetchAsCoordinator } from '../../utils/fetchWithRole';
import usePlayerTheme from '../../hooks/usePlayerTheme';
import { useNavigate } from 'react-router-dom';
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

function CoordinatorDashboard() {
  const navigate = useNavigate();
  const [isDark, toggleTheme] = usePlayerTheme();
  
  const [name, setName] = useState('Coordinator');
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [visibleCount, setVisibleCount] = useState(5);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [nameRes, meetRes] = await Promise.all([
          fetchAsCoordinator('/coordinator/api/name'),
          fetchAsCoordinator('/coordinator/api/meetings/upcoming'),
        ]);
        const nameData = await nameRes.json();
        const meetingsData = await meetRes.json();
        setName(nameData?.name || 'Coordinator');
        setMeetings(Array.isArray(meetingsData) ? meetingsData : []);
      } catch (e) {
        console.error(e);
        setError('Error loading data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const styles = useMemo(() => ({
    errorBox: {
      background: '#ffdddd',
      color: '#cc0000',
      padding: '1rem',
      borderRadius: 8,
      marginBottom: '1rem',
      display: error ? 'block' : 'none'
    }
  }), [error]);

  // Coordinator-specific nav links used by AnimatedSidebar
  const coordinatorLinks = [
    { path: '/coordinator/coordinator_profile', label: 'Profile', icon: 'fas fa-user' },
    { path: '/coordinator/tournament_management', label: 'Tournaments', icon: 'fas fa-trophy' },
    { path: '/coordinator/player_stats', label: 'Player Stats', icon: 'fas fa-chess' },
    { path: '/coordinator/streaming_control', label: 'Streaming Control', icon: 'fas fa-broadcast-tower' },
    { path: '/coordinator/store_management', label: 'Store', icon: 'fas fa-store' },
    { path: '/coordinator/coordinator_meetings', label: 'Meetings', icon: 'fas fa-calendar' },
    { path: '/coordinator/coordinator_chat', label: 'Live Chat', icon: 'fas fa-comments' }
  ];

  const visibleMeetings = useMemo(() => meetings.slice(0, visibleCount), [meetings, visibleCount]);

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Head styles (scoped) */}
      <style>{`
        /* Theme variables provided by .player-neo when on /coordinator pages */
        * { margin:0; padding:0; box-sizing:border-box; }
        body, #root { min-height: 100vh; }
        .page { font-family: 'Playfair Display', serif; background-color: var(--page-bg); min-height: 100vh; display:flex; color: var(--text-color); }
        .sidebar { display: none; }
        .sidebar-header { display: none; }
        .nav-section { margin-bottom:1rem; padding:0 1rem; }
        .nav-section-title { color:var(--text-color); font-size:0.9rem; text-transform:uppercase; padding:0.5rem 1rem; opacity:0.7; }
        .sidebar a { display:flex; align-items:center; gap:0.8rem; color:var(--sidebar-text); text-decoration:none; padding:0.8rem 1.5rem; transition:all 0.3s ease; font-family:'Playfair Display', serif; border-radius:5px; margin:0.2rem 0; }
        .sidebar a:hover { background:rgba(var(--sea-green-rgb),0.12); color:var(--text-color); transform: translateX(5px); }
        .sidebar a i { width:20px; text-align:center; }
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
        .logout-box { position:absolute; bottom:2rem; width:100%; padding:0 2rem; }
        .logout-box button { width:100%; background: linear-gradient(90deg, var(--sky-blue), var(--sea-green)); color:var(--on-accent); border:none; padding:1rem; border-radius:8px; cursor:pointer; font-family:'Cinzel', serif; font-weight:bold; transition:all 0.25s ease; display:flex; align-items:center; justify-content:center; gap:0.5rem; }
        .logout-box button:hover { transform: translateY(-2px); box-shadow:0 8px 24px rgba(6,56,80,0.08); }
        .more-btn{ padding:0.6rem 1rem; border:none; border-radius:8px; cursor:pointer; font-family:'Cinzel', serif; font-weight:bold; transition:all 0.3s ease; display:flex; align-items:center; gap:0.5rem; background-color:var(--sea-green); color:var(--on-accent); }
        @media (max-width: 768px){
          .sidebar{ width:100%; left:${sidebarOpen ? '0' : '-100%'}; transition:0.3s; }
          .content{ margin-left:0; padding:1rem; }
          .updates-section{ padding:1rem; }
          h1{ font-size:1.8rem; flex-direction:column; text-align:center; gap:0.5rem; }
          .menu-btn{ display:block; position:fixed; left:1rem; top:1rem; background:var(--sea-green); color:var(--on-accent); border:none; padding:0.8rem; border-radius:8px; cursor:pointer; z-index:1001; transition:all 0.3s ease; }
          .menu-btn:hover{ background:#236B43; transform: scale(1.05); }
        }
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
          <i className="fas fa-chess-rook" />
        </motion.div>
        
        {/* Site dropdown sidebar (AnimatedSidebar) */}
        <AnimatedSidebar links={coordinatorLinks} logo={<i className="fas fa-chess" />} title={`ChessHive`} />

        {/* Coordinator quick header: theme toggle, welcome */}
        <div className="coordinator-dash-header" style={{ position: 'fixed', top: 18, right: 18, zIndex: 1001, display: 'flex', gap: '12px', alignItems: 'center' }}>
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
          <div style={{ color: 'var(--sea-green)', fontWeight: '600' }}>Welcome, {name}</div>
        </div>

        {/* Content */}
        <div className="content chess-dash-checkerboard">
          <div style={styles.errorBox}>
            <strong>Error loading data:</strong> <span>{error}</span>
          </div>

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
                <i className="fas fa-chess-queen chess-king-glow chess-piece-breathe" aria-hidden="true" />
              </motion.span>
              Welcome to ChessHive, {name}!
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
                visibleMeetings.map((m, idx) => (
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
                {visibleCount < meetings.length && (
                  <button type="button" className="more-btn" onClick={() => setVisibleCount((c) => Math.min(c + 5, meetings.length))}>
                    <i className="fas fa-chevron-down" /> More
                  </button>
                )}
                {visibleCount > 5 && (
                  <button type="button" className="more-btn" onClick={() => setVisibleCount((c) => Math.max(5, c - 5))}>
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

export default CoordinatorDashboard;
