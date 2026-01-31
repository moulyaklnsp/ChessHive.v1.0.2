import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isDark, toggleTheme] = usePlayerTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);
  const [adminName, setAdminName] = useState('Admin');
  const [messages, setMessages] = useState([]);
  const [visibleRows, setVisibleRows] = useState(10);
  const rowsPerPage = 10;

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

  useEffect(() => {
    // Open sidebar by default on desktop
    if (!isMobile) setSidebarOpen(true);
  }, [isMobile]);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch('/admin/api/dashboard', { credentials: 'include' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setAdminName(data?.adminName || 'Admin');
      setMessages(Array.isArray(data?.contactMessages) ? data.contactMessages : []);
      setVisibleRows(10);
    } catch (e) {
      // Fail silently but keep basic UI responsive
      // Optionally, could set an error banner
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const canNext = useMemo(() => visibleRows < messages.length, [visibleRows, messages.length]);
  const canPrev = useMemo(() => visibleRows > rowsPerPage, [visibleRows]);

  const adminLinks = [
    { path: '/admin/organizer_management', label: 'Manage Organizers', icon: 'fas fa-users-cog' },
    { path: '/admin/coordinator_management', label: 'Manage Coordinators', icon: 'fas fa-user-tie' },
    { path: '/admin/player_management', label: 'Manage Players', icon: 'fas fa-user-tie' },
    { path: '/admin/admin_tournament_management', label: 'Tournament Approvals', icon: 'fas fa-trophy' },
    { path: '/admin/payments', label: 'Payments & Subscriptions', icon: 'fas fa-money-bill-wave' }
  ];

  const handleLogout = () => navigate('/login');

  const visibleMessages = useMemo(() => messages.slice(0, Math.min(visibleRows, messages.length)), [messages, visibleRows]);

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
        .updates-section ul { list-style:none; }
        .updates-section li { padding:1rem; border-bottom:1px solid rgba(var(--sea-green-rgb, 27, 94, 63), 0.1); transition:all 0.3s ease; display:flex; flex-direction:column; gap:0.5rem; }
        .updates-section li:last-child { border-bottom:none; }
        .updates-section li:hover { background: rgba(var(--sea-green-rgb, 27, 94, 63), 0.1); transform: translateX(5px); border-radius:8px; }
        .row-counter { text-align:center; margin-bottom:1rem; font-family:'Cinzel', serif; font-size:1.2rem; color:var(--sea-green); background-color:rgba(var(--sea-green-rgb, 27, 94, 63), 0.1); padding:0.5rem 1rem; border-radius:8px; display:inline-block; }
        .page-btn { display:inline-flex; align-items:center; gap:0.5rem; background-color:var(--sea-green); color:var(--on-accent); text-decoration:none; padding:0.8rem 1.5rem; border-radius:8px; transition:all 0.3s ease; font-family:'Cinzel', serif; font-weight:bold; cursor:pointer; border:none; }
        .person-name { color:var(--sea-green); background:rgba(var(--sea-green-rgb, 27, 94, 63), 0.2); padding:0.3rem 0.6rem; border-radius:4px; font-weight:bold; font-family:'Cinzel', serif; }
        .message-label { color:var(--sea-green); background:rgba(var(--sea-green-rgb, 27, 94, 63), 0.1); padding:0.2rem 0.5rem; border-radius:4px; font-weight:bold; }
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
          <i className="fas fa-chess-king" />
        </motion.div>
        
        <AnimatedSidebar links={adminLinks} logo={<i className="fas fa-chess" />} title={`ChessHive`} />

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
          <div style={{ color: 'var(--sea-green)', fontWeight: '600' }}>Welcome, {adminName}</div>
        </div>

        <div className="content chess-dash-checkerboard">
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
              Welcome to ChessHive, {adminName}!
            </h1>
            <div />
          </motion.div>

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
                <i className="fas fa-envelope chess-piece-breathe" style={{ animationDelay: '0s' }} />
              </motion.span>
              Contact Messages
            </h3>
            <div style={{ textAlign: 'center' }}>
              <span className="row-counter">{`${Math.min(visibleRows, messages.length)}/10`}</span>
            </div>
            <motion.ul variants={listVariants} initial="hidden" animate="visible">
              {visibleMessages.length === 0 ? (
                <motion.li variants={itemVariants}><i className="fas fa-info-circle" /> No messages.</motion.li>
              ) : (
                visibleMessages.map((m, idx) => (
                  <motion.li key={idx} custom={idx} variants={itemVariants}>
                    <div>
                      <span className="message-label">Name:</span>{' '}
                      <span className="person-name">{m.name}</span>
                    </div>
                    <div>
                      <span className="message-label">Message:</span>{' '}
                      <span>{m.message}</span>
                    </div>
                  </motion.li>
                ))
              )}
            </motion.ul>

            <div style={{ textAlign: 'center', margin: '1rem 0', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              {canNext && (
                <button type="button" className="page-btn" onClick={() => setVisibleRows((v) => v + rowsPerPage)}>
                  <i className="fas fa-chevron-right" /> Next
                </button>
              )}
              {canPrev && (
                <button type="button" className="page-btn" onClick={() => setVisibleRows((v) => Math.max(rowsPerPage, v - rowsPerPage))}>
                  <i className="fas fa-chevron-left" /> Previous
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
