import React, { useEffect, useState } from 'react';
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

function CoordinatorProfile() {
  const [isDark, toggleTheme] = usePlayerTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState({ name: '', email: '', college: '' });

  const loadProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/coordinator/api/profile', { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load profile');
      setProfile({ name: data.name || 'N/A', email: data.email || 'N/A', college: data.college || 'N/A' });
    } catch (e) {
      console.error(e);
      setError('Error loading profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProfile(); }, []);

  const deleteAccount = async () => {
    const ok = window.confirm('Are you sure you want to delete your account?');
    if (!ok) return;
    try {
      const res = await fetch('/coordinator/api/profile', { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        alert('Account deleted successfully. You will be redirected to login page');
        navigate('/login?message=Account deleted');
      } else {
        alert('Failed to delete account: ' + (data.message || 'Unknown error'));
      }
    } catch (e) {
      console.error(e);
      alert('Error deleting account. Please try again.');
    }
  };

  const styles = {
    root: { fontFamily: 'Playfair Display, serif', backgroundColor: '#FFFDD0', minHeight: '100vh', padding: '2rem' },
    container: { maxWidth: 800, margin: '0 auto' },
    h1: { fontFamily: 'Cinzel, serif', fontSize: '2.5rem', color: '#2E8B57', marginBottom: '2rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' },
    card: { background: 'var(--card-bg)', borderRadius: 15, padding: '2rem', boxShadow: 'none', border: '1px solid var(--card-border)' },
    infoGrid: { display: 'grid', gap: '1.5rem', marginBottom: '2rem' },
    infoItem: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderBottom: '1px solid rgba(46,139,87,0.2)' },
    label: { fontFamily: 'Cinzel, serif', fontWeight: 'bold', color: '#2E8B57', minWidth: 100, display: 'flex', alignItems: 'center', gap: '0.5rem' },
    value: { color: '#333', flexGrow: 1 },
    actions: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', gap: '1rem', flexWrap: 'wrap' },
    backLink: { display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#2E8B57', color: '#fff', textDecoration: 'none', padding: '0.8rem 1.5rem', borderRadius: 8, fontFamily: 'Cinzel, serif', fontWeight: 'bold' },
    delBtn: { background: '#d32f2f', color: '#fff', border: 'none', padding: '0.8rem 1.5rem', borderRadius: 8, cursor: 'pointer', fontFamily: 'Cinzel, serif', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' },
    err: { color: '#b71c1c', marginBottom: '1rem', textAlign: 'center' },
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
            <i className="fas fa-user" /> Coordinator Profile
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
              <p>Loading…</p>
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
                  <Link to="/coordinator/coordinator_dashboard" className="btn-primary"><i className="fas fa-arrow-left" /> Back to Dashboard</Link>
                  <button type="button" className="btn-danger" onClick={deleteAccount}><i className="fas fa-trash" /> Delete Account</button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default CoordinatorProfile;
