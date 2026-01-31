import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import usePlayerTheme from '../../hooks/usePlayerTheme';
import '../../styles/playerNeoNoir.css';

function PlayerSettings() {
  const navigate = useNavigate();
  const [isDark, toggleTheme, setWallpaperUrl, wallpaperUrl] = usePlayerTheme();
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [wallpaperFile, setWallpaperFile] = useState(null);
  const [wallpaperUploading, setWallpaperUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const wallpaperPreviewUrl = useMemo(() => {
    if (!wallpaperFile) return '';
    try {
      return URL.createObjectURL(wallpaperFile);
    } catch (e) {
      return '';
    }
  }, [wallpaperFile]);

  useEffect(() => {
    return () => {
      if (wallpaperPreviewUrl) {
        try { URL.revokeObjectURL(wallpaperPreviewUrl); } catch (e) {}
      }
    };
  }, [wallpaperPreviewUrl]);

  useEffect(() => {
    const saved = localStorage.getItem('player_notifications_enabled');
    if (saved === null) {
      localStorage.setItem('player_notifications_enabled', 'true');
      setNotifEnabled(true);
    } else {
      setNotifEnabled(saved === 'true');
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/session', { credentials: 'include' });
        const data = await res.json().catch(() => ({}));
        if (!cancelled && data?.userRole !== 'player') {
          navigate('/login');
        }
      } catch (e) {
        if (!cancelled) navigate('/login');
      }
    })();
    return () => { cancelled = true; };
  }, [navigate]);

  const saveNotifPref = (value) => {
    setNotifEnabled(value);
    localStorage.setItem('player_notifications_enabled', value ? 'true' : 'false');
    setSuccessMsg('Notification preference saved');
    setTimeout(() => setSuccessMsg(''), 1500);
  };

  const deleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account?')) return;
    setDeleting(true);
    setErrorMsg('');
    try {
      const res = await fetch('/player/api/deleteAccount', {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      // Deleted; redirect to login
      navigate('/login');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete account');
    } finally {
      setDeleting(false);
    }
  };

  const logout = () => {
    navigate('/login');
  };

  const uploadWallpaper = async () => {
    if (!wallpaperFile) return;
    setWallpaperUploading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const fd = new FormData();
      fd.append('wallpaper', wallpaperFile);
      const res = await fetch('/player/api/profile/wallpaper', {
        method: 'POST',
        credentials: 'include',
        body: fd
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`);
      const url = (body.wallpaper_url || '').toString();
      if (!url) throw new Error('Upload succeeded but no URL returned');
      setWallpaperUrl(url);
      setWallpaperFile(null);
      setSuccessMsg('Wallpaper updated');
      setTimeout(() => setSuccessMsg(''), 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to upload wallpaper');
    } finally {
      setWallpaperUploading(false);
    }
  };

  const removeWallpaper = async () => {
    if (!window.confirm('Remove your wallpaper?')) return;
    setWallpaperUploading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch('/player/api/profile/wallpaper', {
        method: 'DELETE',
        credentials: 'include'
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`);
      setWallpaperUrl('');
      setWallpaperFile(null);
      setSuccessMsg('Wallpaper removed');
      setTimeout(() => setSuccessMsg(''), 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to remove wallpaper');
    } finally {
      setWallpaperUploading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <style>{`
        .page { font-family:'Playfair Display', serif; min-height:100vh; padding:2rem; }
        .card { background:var(--card-bg); border:1px solid var(--card-border); border-radius:15px; padding:2rem; margin-bottom:2rem; box-shadow:none; }
        h1 { font-family:'Cinzel', serif; color:var(--sea-green); margin-bottom:1.5rem; }
        .row { display:flex; align-items:center; justify-content:space-between; gap:1rem; }
        .btn { background:var(--sea-green); color:#fff; border:none; padding:0.6rem 1rem; border-radius:8px; cursor:pointer; font-family:'Cinzel', serif; font-weight:bold; }
        .btn.secondary { background:var(--sky-blue); color:#004b63; }
        .danger { background:#ff4d4d; }
        .switch { display:flex; align-items:center; gap:0.6rem; }
        .error { color:#b00020; margin:0.5rem 0; }
        .success { color:#2e7d32; margin:0.5rem 0; }
        .hint { opacity:0.85; margin-top:0.5rem; }
        .preview { margin-top:0.9rem; border-radius:12px; overflow:hidden; border:1px solid rgba(0,0,0,0.08); }
        .preview img { width:100%; height:220px; object-fit:cover; display:block; }
      `}</style>

      <div className="page player-neo">
        <div className="row" style={{ marginBottom:'1rem' }}>
          <h1 style={{ margin:0 }}>Player Settings</h1>
          <button className="btn secondary" onClick={() => navigate('/player/player_dashboard')}>Back to Dashboard</button>
        </div>

        {errorMsg && <div className="error">{errorMsg}</div>}
        {successMsg && <div className="success">{successMsg}</div>}

        <div className="card">
          <h3>Theme</h3>
          <div className="row">
            <span>Current: {isDark ? 'Dark' : 'Light'}</span>
            <button className="btn secondary" onClick={toggleTheme}>{isDark ? 'Switch to Light' : 'Switch to Dark'}</button>
          </div>
        </div>

        <div className="card">
          <h3>Background / Wallpaper</h3>
          <div className="hint">Choose an image from your laptop (JPG/PNG/WebP/GIF, up to 15MB). We’ll upload it to Cloudinary and use it as your Player background.</div>

          <div className="row" style={{ flexWrap: 'wrap', marginTop: '0.9rem' }}>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setWallpaperFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
              disabled={wallpaperUploading}
            />

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                className="btn secondary"
                onClick={uploadWallpaper}
                disabled={!wallpaperFile || wallpaperUploading}
              >
                {wallpaperUploading ? 'Uploading…' : 'Upload Wallpaper'}
              </button>

              <button
                className="btn danger"
                onClick={removeWallpaper}
                disabled={!wallpaperUrl || wallpaperUploading}
              >
                Remove Wallpaper
              </button>
            </div>
          </div>

          {(wallpaperPreviewUrl || wallpaperUrl) && (
            <div className="preview">
              <img src={wallpaperPreviewUrl || wallpaperUrl} alt="Wallpaper preview" />
            </div>
          )}
        </div>

        <div className="card">
          <h3>Notifications</h3>
          <div className="switch">
            <label htmlFor="notif-toggle">Enable notifications</label>
            <input id="notif-toggle" type="checkbox" checked={notifEnabled} onChange={(e) => saveNotifPref(e.target.checked)} />
          </div>
        </div>

        <div className="card">
          <h3>Account</h3>
          <div className="row" style={{ flexWrap:'wrap' }}>
            <button className="btn danger" onClick={deleteAccount} disabled={deleting}>{deleting ? 'Deleting...' : 'Delete Account'}</button>
            <button className="btn" onClick={logout}>Log Out</button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default PlayerSettings;