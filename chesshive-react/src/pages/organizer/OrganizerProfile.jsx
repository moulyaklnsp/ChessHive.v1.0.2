import React, { useEffect, useRef, useState, useCallback } from 'react';
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

const OrganizerProfile = () => {
  const navigate = useNavigate();
  const [isDark, toggleTheme] = usePlayerTheme();
  const [profile, setProfile] = useState({ name: '', email: '', college: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const timeoutRef = useRef(null);

  const clearMessageLater = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setMessage({ type: '', text: '' });
      timeoutRef.current = null;
    }, 3000);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/organizer/api/profile', {
          credentials: 'include',
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          setProfile({
            name: data?.name || 'N/A',
            email: data?.email || 'N/A',
            college: data?.college || 'N/A',
          });
        }
      } catch (e) {
        if (!cancelled) setError('Failed to fetch profile.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleDelete = async () => {
    if (!profile.email || profile.email === 'N/A') {
      setMessage({ type: 'error', text: 'Cannot determine account to delete' });
      clearMessageLater();
      return;
    }
    // eslint-disable-next-line no-restricted-globals
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }
    try {
      const res = await fetch(`/organizer/api/organizers/${encodeURIComponent(profile.email)}`, {
        method: 'DELETE',
        headers: { Accept: 'application/json' },
        credentials: 'include',
      });
      let data = {};
      try { data = await res.json(); } catch (_) {}
      if (res.ok && (data?.success ?? false)) {
        setMessage({ type: 'success', text: data?.message || 'Account deleted successfully.' });
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setMessage({ type: 'error', text: data?.message || `Failed to delete account (HTTP ${res.status})` });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Failed to delete account' });
    } finally {
      clearMessageLater();
    }
  };

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
        .info-grid { display:grid; gap:1.5rem; margin-bottom:2rem; }
        .info-item { display:flex; align-items:center; gap:1rem; padding:1rem; border-bottom:1px solid rgba(var(--sea-green-rgb, 27, 94, 63), 0.2); }
        .info-label { font-family:'Cinzel', serif; font-weight:bold; color:var(--sea-green); min-width:100px; display:flex; align-items:center; gap:0.5rem; }
        .info-value { color:var(--text-color); flex-grow:1; }
        .actions-row { display:flex; justify-content:space-between; align-items:center; margin-top:2rem; gap:1rem; flex-wrap:wrap; }
        .btn-primary { background:var(--sea-green); color:var(--on-accent); border:none; padding:0.8rem 1.5rem; border-radius:8px; cursor:pointer; font-family:'Cinzel', serif; font-weight:bold; display:inline-flex; align-items:center; gap:0.5rem; text-decoration:none; }
        .btn-danger { background:#d32f2f; color:var(--on-accent); border:none; padding:0.8rem 1.5rem; border-radius:8px; cursor:pointer; font-family:'Cinzel', serif; font-weight:bold; display:inline-flex; align-items:center; gap:0.5rem; }
        .error-text { color:#b71c1c; margin-bottom:1rem; text-align:center; }
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
          <i className="fas fa-user" />
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
            <i className="fas fa-user" /> Organizer Profile
          </motion.h1>

          <motion.div
            className="updates-section"
            custom={0}
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
          >
            {error && <div className="error-text">{error}</div>}
            {loading ? (
              <p>Loading profile…</p>
            ) : (
              <>
                <div className="info-grid">
                  <div className="info-item">
                    <div className="info-label"><i className="fas fa-user" /> Name:</div>
                    <div className="info-value">{profile.name}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label"><i className="fas fa-envelope" /> Email:</div>
                    <div className="info-value">{profile.email}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label"><i className="fas fa-university" /> College:</div>
                    <div className="info-value">{profile.college}</div>
                  </div>
                </div>

                <div className="actions-row">
                  <Link to="/organizer/organizer_dashboard" className="btn-primary"><i className="fas fa-arrow-left" /> Back to Dashboard</Link>
                  <button type="button" className="btn-danger" onClick={handleDelete}><i className="fas fa-trash" /> Delete Account</button>
                </div>
              </>
            )}
            
            {message.text && (
              <div style={{ 
                marginTop: '1rem', 
                padding: '1rem', 
                borderRadius: 8, 
                textAlign: 'center',
                backgroundColor: message.type === 'error' ? 'rgba(198,40,40,0.1)' : 'rgba(46,125,50,0.1)', 
                color: message.type === 'error' ? '#c62828' : '#1b5e20' 
              }}>
                {message.text}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerProfile;
