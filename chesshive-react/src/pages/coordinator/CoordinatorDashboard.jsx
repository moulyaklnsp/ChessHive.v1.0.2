import React, { useEffect, useMemo, useState, useCallback } from 'react';
import '../../styles/playerNeoNoir.css';
import { motion } from 'framer-motion';
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
          fetch('/coordinator/api/name', { credentials: 'include' }),
          fetch('/coordinator/api/meetings/upcoming', { credentials: 'include' }),
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

  useEffect(() => {
    if (!isMobile) setSidebarOpen(true);
    else setSidebarOpen(false);
  }, [isMobile]);

  const styles = {
    root: { display: 'flex', minHeight: '100vh', backgroundColor: '#FFFDD0', fontFamily: 'Playfair Display, serif' },
    sidebar: {
      width: 280,
      backgroundColor: '#2E8B57',
      color: '#fff',
      height: '100vh',
      position: isMobile ? 'fixed' : 'fixed',
      left: isMobile ? (sidebarOpen ? 0 : '-100%') : 0,
      top: 0,
      paddingTop: '1rem',
      zIndex: 1000,
      boxShadow: '4px 0 10px rgba(0,0,0,0.1)',
      transition: 'left 0.3s ease',
    },
    sidebarHeader: { textAlign: 'center', padding: '1rem', borderBottom: '2px solid rgba(255,255,255,0.1)', marginBottom: '1rem' },
    navSection: { marginBottom: '1rem', padding: '0 1rem' },
    navTitle: { color: '#FFFDD0', fontSize: '0.9rem', textTransform: 'uppercase', padding: '0.5rem 1rem', opacity: 0.7 },
    link: { display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#fff', textDecoration: 'none', padding: '0.8rem 1.5rem', transition: 'all 0.3s ease', borderRadius: 5, margin: '0.2rem 0' },
    content: { flexGrow: 1, marginLeft: isMobile ? 0 : 280, padding: '2rem' },
    h1: { fontFamily: 'Cinzel, serif', color: '#2E8B57', marginBottom: '2rem', fontSize: isMobile ? '1.8rem' : '2.5rem', display: 'flex', alignItems: isMobile ? 'start' : 'center', gap: '1rem', flexDirection: isMobile ? 'column' : 'row' },
    formContainer: { background: 'var(--card-bg)', padding: '2rem', borderRadius: 15, boxShadow: 'none', marginBottom: '2rem', border: '1px solid var(--card-border)' },
    joinLink: { backgroundColor: '#87CEEB', color: '#2E8B57', padding: '0.5rem 1rem', borderRadius: 20, textDecoration: 'none', fontWeight: 'bold', transition: 'all 0.3s ease', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' },
    moreRow: { textAlign: 'center', margin: '1rem 0', display: 'flex', justifyContent: 'center', gap: '1rem' },
    moreBtn: { display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#87CEEB', color: '#2E8B57', textDecoration: 'none', padding: '0.8rem 1.5rem', borderRadius: 8, transition: 'all 0.3s ease', fontFamily: 'Cinzel, serif', fontWeight: 'bold', cursor: 'pointer', border: 'none' },
    logoutBox: { position: 'absolute', bottom: '2rem', width: '100%', padding: '0 2rem' },
    logoutBtn: { width: '100%', background: '#87CEEB', color: '#2E8B57', border: 'none', padding: '1rem', borderRadius: 8, cursor: 'pointer', fontFamily: 'Cinzel, serif', fontWeight: 'bold', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' },
    menuBtn: { display: isMobile ? 'block' : 'none', position: 'fixed', left: '1rem', top: '1rem', background: '#2E8B57', color: '#fff', border: 'none', padding: '0.8rem', borderRadius: 8, cursor: 'pointer', zIndex: 1001 },
    ul: { listStyle: 'none', paddingLeft: 0, display: 'grid', gap: '0.5rem' },
    li: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid rgba(0,0,0,0.06)' },
    emptyText: { color: '#666' },
  };

  const visibleMeetings = useMemo(() => meetings.slice(0, visibleCount), [meetings, visibleCount]);

  return (
    <div style={styles.root}>
      <button style={styles.menuBtn} onClick={() => setSidebarOpen((v) => !v)} aria-label="Open menu">
        <i className="fas fa-bars" />
      </button>

      <aside style={styles.sidebar} aria-hidden={!sidebarOpen && isMobile}>
        <div style={styles.sidebarHeader}>
          <h2><i className="fas fa-chess" /> ChessHive</h2>
        </div>
          <div style={styles.navSection}>
          <div style={styles.navTitle}>Main Menu</div>
          {/* Keep server routes for now to avoid SPA 404s for pages not yet migrated */}
          <a href="/coordinator/coordinator_profile" style={styles.link}><i className="fas fa-user" /> Profile</a>
          <a href="/coordinator/tournament_management" style={styles.link}><i className="fas fa-trophy" /> Tournaments</a>
          <a href="/coordinator/player_stats" style={styles.link}><i className="fas fa-chess" /> Player Stats</a>
          <a href="/coordinator/streaming_control" style={styles.link}><i className="fas fa-broadcast-tower" /> Streaming Control</a>
          <a href="/coordinator/store_management" style={styles.link}><i className="fas fa-store" /> Store</a>
          <a href="/coordinator/coordinator_meetings" style={styles.link}><i className="fas fa-calendar" /> Meetings</a>
          <a href="/coordinator/coordinator_chat" style={styles.link}><i className="fas fa-comments" /> Live Chat</a>
        </div>
        <div style={styles.logoutBox}>
          <button style={styles.logoutBtn} onClick={() => { window.location.href = '/login'; }}>
            <i className="fas fa-sign-out-alt" />
            <span>Log Out</span>
          </button>
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
