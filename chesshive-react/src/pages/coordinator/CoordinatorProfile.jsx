import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/playerNeoNoir.css';
import { motion } from 'framer-motion';
import { fetchAsCoordinator } from '../../utils/fetchWithRole';
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
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState('');
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoStatus, setPhotoStatus] = useState(null); // { type: 'success' | 'error', text: string }

  const loadProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchAsCoordinator('/coordinator/api/profile');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load profile');
      setProfile({ name: data.name || 'N/A', email: data.email || 'N/A', college: data.college || 'N/A' });
      // Load the saved profile photo from database
      if (data.profile_photo_url) {
        setPhotoPreviewUrl(data.profile_photo_url);
      }
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
      const res = await fetchAsCoordinator('/coordinator/api/profile', { method: 'DELETE' });
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

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handlePhotoUpload = async () => {
    if (!photoFile) {
      setPhotoStatus({ type: 'error', text: 'Please select a photo first' });
      return;
    }

    setPhotoUploading(true);
    setPhotoStatus(null);

    try {
      const formData = new FormData();
      formData.append('photo', photoFile);

      const res = await fetchAsCoordinator('/coordinator/api/upload-photo', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      console.log('Upload response:', { status: res.status, data });

      if (res.ok && data.success) {
        setPhotoStatus({ type: 'success', text: 'Photo uploaded successfully!' });
        // Use the uploaded photo URL from the server
        if (data.profile_photo_url) {
          setPhotoPreviewUrl(data.profile_photo_url);
        }
        setPhotoFile(null);
        setTimeout(() => setPhotoStatus(null), 3000);
      } else {
        setPhotoStatus({ type: 'error', text: data.error || data.message || 'Failed to upload photo' });
      }
    } catch (e) {
      console.error('Upload error:', e);
      setPhotoStatus({ type: 'error', text: 'Error uploading photo: ' + e.message });
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleLogout = () => {
    // Implement logout functionality
    navigate('/login');
  };

  const coordinatorLinks = [
    { path: '/coordinator/coordinator_profile', label: 'Profile', icon: 'fas fa-user' },
    { path: '/coordinator/tournament_management', label: 'Tournaments', icon: 'fas fa-trophy' },
    { path: '/coordinator/player_stats', label: 'Player Stats', icon: 'fas fa-chess' },
    { path: '/coordinator/streaming_control', label: 'Streaming Control', icon: 'fas fa-broadcast-tower' },
    { path: '/coordinator/store_management', label: 'Store', icon: 'fas fa-store' },
    { path: '/coordinator/coordinator_meetings', label: 'Meetings', icon: 'fas fa-calendar' },
    { path: '/coordinator/coordinator_chat', label: 'Live Chat', icon: 'fas fa-comments' }
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

          <div className="profile-photo-section" style={{ marginBottom: '2rem', textAlign: 'center' }}>
            {photoPreviewUrl ? (
              <motion.img
                src={photoPreviewUrl}
                alt="Profile Preview"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                style={{ width: 140, height: 140, borderRadius: '50%', objectFit: 'cover', marginBottom: '1rem', border: '4px solid var(--sea-green)' }}
              />
            ) : (
              <div style={{ width: 140, height: 140, borderRadius: '50%', marginBottom: '1rem', background: 'rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px dashed var(--sea-green)', margin: '0 auto 1rem' }}>
                <i className="fas fa-user-circle" style={{ fontSize: '3rem', color: 'var(--sea-green)' }} />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              style={{ display: 'none' }}
              id="profile-photo-upload"
            />
            <motion.button
              type="button"
              onClick={() => document.getElementById('profile-photo-upload').click()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: 'var(--sea-green)',
                color: 'var(--on-accent)',
                border: 'none',
                padding: '0.8rem 1.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontFamily: 'Cinzel, serif',
                fontWeight: 'bold',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                textDecoration: 'none'
              }}
            >
              <i className="fas fa-upload" /> Select Photo
            </motion.button>
            {photoFile && (
              <motion.button
                type="button"
                onClick={handlePhotoUpload}
                disabled={photoUploading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: 'var(--sea-green)',
                  color: 'var(--on-accent)',
                  border: 'none',
                  padding: '0.8rem 1.5rem',
                  borderRadius: '8px',
                  cursor: photoUploading ? 'not-allowed' : 'pointer',
                  fontFamily: 'Cinzel, serif',
                  fontWeight: 'bold',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginLeft: '1rem',
                  opacity: photoUploading ? 0.6 : 1
                }}
              >
                <i className="fas fa-check" /> {photoUploading ? 'Uploading...' : 'Confirm Upload'}
              </motion.button>
            )}
            {photoStatus && (
              <p style={{ marginTop: '0.5rem', color: photoStatus.type === 'success' ? '#2e7d32' : '#b71c1c' }}>
                <i className={`fas fa-${photoStatus.type === 'success' ? 'check-circle' : 'exclamation-circle'}`} style={{ marginRight: '0.5rem' }} />
                {photoStatus.text}
              </p>
            )}
          </div>

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

          <div className="actions-row" style={{ marginTop: '2rem' }}>
            <button type="button" className="btn-primary" onClick={handleLogout}><i className="fas fa-sign-out-alt" /> Logout</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CoordinatorProfile;
