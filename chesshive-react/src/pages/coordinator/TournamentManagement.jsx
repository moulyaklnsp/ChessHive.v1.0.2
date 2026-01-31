import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import '../../styles/playerNeoNoir.css';
import { motion } from 'framer-motion';
import usePlayerTheme from '../../hooks/usePlayerTheme';
import AnimatedSidebar from '../../components/AnimatedSidebar';

const ROWS_PER_PAGE = 5;

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

function TournamentManagement() {
  const [isDark, toggleTheme] = usePlayerTheme();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState(null);
  const [visibleRows, setVisibleRows] = useState(ROWS_PER_PAGE);

  // Form state
  const [form, setForm] = useState({
    tournamentName: '',
    tournamentDate: '',
    tournamentTime: '',
    tournamentLocation: '',
    entryFee: '',
    type: '',
    noOfRounds: ''
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [, setSearchParams] = useSearchParams();

  const showMessage = (text, type = 'success') => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/coordinator/api/tournaments', { credentials: 'include' });
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const data = await res.json();
      const list = Array.isArray(data?.tournaments) ? data.tournaments : [];
      setTournaments(list);
      setVisibleRows(ROWS_PER_PAGE);
    } catch (e) {
      console.error('Fetch tournaments error:', e);
      setError('Error fetching tournaments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  // Filter out removed tournaments
  const activeTournaments = useMemo(
    () => tournaments.filter((t) => t.status !== 'Removed'),
    [tournaments]
  );

  // Compute status based on 1-hour duration window using date + time
  const computeStatus = (t) => {
    let status = t.status || 'Pending';
    let statusClass = 'pending';
    const dateOnly = new Date(t.date);
    const timeStr = (t.time || '').toString(); // expected HH:MM (24h)
    // Build start Date from date + time
    const [hh, mm] = (timeStr.match(/^\d{2}:\d{2}$/) ? timeStr.split(':') : ['00', '00']);
    const start = new Date(dateOnly);
    if (!isNaN(parseInt(hh)) && !isNaN(parseInt(mm))) {
      start.setHours(parseInt(hh, 10), parseInt(mm, 10), 0, 0);
    }
    const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour duration
    const now = new Date();

    if (t.status === 'Approved' || t.status === 'Ongoing') {
      if (now >= end) {
        status = 'Completed';
        statusClass = 'completed';
      } else if (now >= start && now < end) {
        status = 'Ongoing';
        statusClass = 'ongoing';
      } else if (now < start) {
        status = 'Yet to Start';
        statusClass = 'yet-to-start';
      }
    } else if (t.status === 'Completed') {
      status = 'Completed';
      statusClass = 'completed';
    } else if (t.status === 'Removed') {
      status = 'Removed';
      statusClass = 'removed';
    } else {
      status = 'Pending';
      statusClass = 'pending';
    }

    return { status, statusClass, dateObj: dateOnly };
  };

  const validate = () => {
    const errors = {};
    const name = form.tournamentName.trim();
    if (!name) errors.tournamentName = 'Tournament name is required.';
    else if (name.length < 3) errors.tournamentName = 'Tournament name must be at least 3 characters long.';
    else if (!/^[a-zA-Z0-9\s\-&]+$/.test(name)) errors.tournamentName = 'Only letters, numbers, spaces, hyphens, and & are allowed.';

    if (!form.tournamentDate) errors.tournamentDate = 'Date is required.';
    else {
      const inputDate = new Date(form.tournamentDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (isNaN(inputDate.getTime())) errors.tournamentDate = 'Invalid date format.';
      else if (inputDate < today) errors.tournamentDate = 'Date cannot be in the past.';
    }

    const time = form.tournamentTime.trim();
    if (!time) errors.tournamentTime = 'Time is required.';
    else if (!/^\d{2}:\d{2}$/.test(time)) errors.tournamentTime = 'Invalid time format (use HH:MM).';

    const location = form.tournamentLocation.trim();
    if (!location) errors.tournamentLocation = 'Location is required.';
    else if (location.length < 3) errors.tournamentLocation = 'Location must be at least 3 characters long.';

    const entryFee = parseFloat(form.entryFee);
    if (isNaN(entryFee)) errors.entryFee = 'Entry fee is required.';
    else if (entryFee < 0) errors.entryFee = 'Entry fee cannot be negative.';

    if (!form.type) errors.type = 'Please select a tournament type.';

    const noOfRounds = parseInt(form.noOfRounds);
    if (isNaN(noOfRounds)) errors.noOfRounds = 'Number of rounds is required.';
    else if (noOfRounds <= 0) errors.noOfRounds = 'Number of rounds must be a positive integer.';
    else if (noOfRounds > 100) errors.noOfRounds = 'Number of rounds cannot exceed 100.';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setForm({
      tournamentName: '',
      tournamentDate: '',
      tournamentTime: '',
      tournamentLocation: '',
      entryFee: '',
      type: '',
      noOfRounds: ''
    });
    setFieldErrors({});
    setEditingId(null);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      showMessage('Please correct the errors in the form.', 'error');
      return;
    }
    const payload = {
      // camelCase fields used by React API
      tournamentName: form.tournamentName.trim(),
      tournamentDate: form.tournamentDate,
      time: form.tournamentTime.trim(),
      location: form.tournamentLocation.trim(),
      entryFee: typeof form.entryFee === 'string' ? parseFloat(form.entryFee) : form.entryFee,
      type: form.type,
      noOfRounds: typeof form.noOfRounds === 'string' ? parseInt(form.noOfRounds, 10) : form.noOfRounds,
      // snake_case fields for legacy API compatibility
      name: form.tournamentName.trim(),
      date: form.tournamentDate,
      entry_fee: typeof form.entryFee === 'string' ? parseFloat(form.entryFee) : form.entryFee,
      no_of_rounds: typeof form.noOfRounds === 'string' ? parseInt(form.noOfRounds, 10) : form.noOfRounds,
      tournamentTime: form.tournamentTime.trim(),
      tournamentLocation: form.tournamentLocation.trim(),
    };
    try {
      const endpoint = editingId ? `/coordinator/api/tournaments/${editingId}` : '/coordinator/api/tournaments';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || 'Failed to submit tournament');
      showMessage(data.message || (editingId ? 'Tournament updated successfully!' : 'Tournament added successfully!'), 'success');
      resetForm();
      await fetchTournaments();
    } catch (err) {
      console.error('Submit error:', err);
      showMessage(`Failed to submit tournament: ${err.message}`, 'error');
    }
  };

  const onEdit = (id) => {
    const t = tournaments.find((x) => x._id === id);
    if (!t) return;
    setEditingId(id);
    setForm({
      tournamentName: t.name || t.tournamentName || '',
      tournamentDate: t.date ? new Date(t.date).toISOString().split('T')[0] : (t.tournamentDate || ''),
      tournamentTime: t.time || t.tournamentTime || '',
      tournamentLocation: t.location || t.tournamentLocation || '',
      entryFee: (typeof t.entry_fee !== 'undefined' ? t.entry_fee : (typeof t.entryFee !== 'undefined' ? t.entryFee : '')),
      type: t.type || '',
      noOfRounds: (typeof t.no_of_rounds !== 'undefined' ? t.no_of_rounds : (typeof t.noOfRounds !== 'undefined' ? t.noOfRounds : ''))
    });
    // preserve current filters in URL if any (optional)
    setSearchParams((prev) => prev);
  };

  const onRemove = async (id) => {
    try {
      const res = await fetch(`/coordinator/api/tournaments/${id}`, { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || 'Failed to remove tournament');
      showMessage('Tournament removed', 'success');
      setTournaments((ts) => ts.filter((t) => t._id !== id));
    } catch (err) {
      console.error('Remove error:', err);
      showMessage('Error removing tournament', 'error');
    }
  };

  const requestFeedback = async (id) => {
    try {
      const res = await fetch(`/coordinator/api/tournaments/${id}/request-feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to request feedback');
      showMessage('Feedback requested successfully', 'success');
      await fetchTournaments();
    } catch (err) {
      console.error('Request feedback error:', err);
      showMessage('Error requesting feedback', 'error');
    }
  };

  const styles = {
    root: { fontFamily: 'Playfair Display, serif', backgroundColor: '#FFFDD0', minHeight: '100vh', padding: '2rem' },
    container: { maxWidth: 1200, margin: '0 auto' },
    h2: { fontFamily: 'Cinzel, serif', fontSize: '2.5rem', color: '#2E8B57', marginBottom: '2rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' },
    card: { background: 'var(--card-bg)', borderRadius: 15, padding: '2rem', boxShadow: 'none', marginBottom: '2rem', border: '1px solid var(--card-border)' },
    label: { fontFamily: 'Cinzel, serif', color: '#2E8B57', marginBottom: 8, display: 'block' },
    input: (hasError) => ({ width: '100%', padding: '0.8rem', border: `2px solid ${hasError ? '#c62828' : '#2E8B57'}`, borderRadius: 8, fontFamily: 'Playfair Display, serif' }),
    select: (hasError) => ({ width: '100%', padding: '0.8rem', border: `2px solid ${hasError ? '#c62828' : 'var(--sea-green)'}`, borderRadius: 8, fontFamily: 'Cinzel, serif', color: 'var(--sea-green)', background: 'var(--card-bg)' }),
    error: { color: '#c62828', fontSize: '0.9rem', marginTop: 4 },
    btn: { background: '#2E8B57', color: '#fff', border: 'none', padding: '1rem', borderRadius: 8, cursor: 'pointer', fontFamily: 'Cinzel, serif', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', width: '100%' },
    tableCard: { background: 'var(--card-bg)', borderRadius: 15, padding: '2rem', boxShadow: 'none', border: '1px solid var(--card-border)' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { background: '#2E8B57', color: '#fff', padding: '1rem', textAlign: 'left', fontFamily: 'Cinzel, serif' },
    td: { padding: '1rem', borderBottom: '1px solid rgba(46, 139, 87, 0.2)' },
    rowHover: { backgroundColor: 'rgba(135, 206, 235, 0.1)' },
    status: (klass) => ({ fontWeight: 'bold', color: klass === 'completed' ? '#2E8B57' : klass === 'ongoing' ? '#87CEEB' : klass === 'yet-to-start' ? '#666' : '#c62828' }),
    actionBtn: { display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#87CEEB', color: '#2E8B57', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: 8, fontFamily: 'Cinzel, serif', fontWeight: 'bold', margin: '0.2rem', border: 'none', cursor: 'pointer' },
    removeBtn: { background: '#c62828', color: '#FFFDD0', border: 'none', padding: '0.5rem 1rem', borderRadius: 8, fontFamily: 'Cinzel, serif', fontWeight: 'bold', margin: '0.2rem', cursor: 'pointer' },
    moreWrap: { textAlign: 'center', margin: '1rem 0', display: 'flex', justifyContent: 'center', gap: '1rem' },
    moreBtn: { display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#87CEEB', color: '#2E8B57', textDecoration: 'none', padding: '0.8rem 1.5rem', borderRadius: 8, fontFamily: 'Cinzel, serif', fontWeight: 'bold', cursor: 'pointer', border: 'none' },
    backRow: { textAlign: 'right', marginTop: '2rem' },
    backLink: { display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#2E8B57', color: '#fff', textDecoration: 'none', padding: '0.8rem 1.5rem', borderRadius: 8, fontFamily: 'Cinzel, serif', fontWeight: 'bold' }
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
        .form-group { margin-bottom: 1rem; }
        .form-label { font-family:'Cinzel', serif; color:var(--sea-green); margin-bottom:8px; display:block; }
        .form-input { width:100%; padding:0.8rem; border:2px solid var(--sea-green); border-radius:8px; font-family:'Playfair Display', serif; background:var(--card-bg); color:var(--text-color); }
        .form-input.error { border-color:#c62828; }
        .error-text { color:#c62828; font-size:0.9rem; margin-top:4px; }
        .btn-primary { background:var(--sea-green); color:var(--on-accent); border:none; padding:1rem; border-radius:8px; cursor:pointer; font-family:'Cinzel', serif; font-weight:bold; display:flex; align-items:center; gap:0.5rem; width:100%; }
        .table-responsive { overflow-x: auto; }
        .tournament-table { width:100%; border-collapse:collapse; }
        .tournament-table th { background:var(--sea-green); color:var(--on-accent); padding:1rem; text-align:left; font-family:'Cinzel', serif; }
        .tournament-table td { padding:1rem; border-bottom:1px solid rgba(var(--sea-green-rgb, 27, 94, 63), 0.2); }
        .action-btn { display:inline-flex; align-items:center; gap:0.5rem; background:var(--sky-blue); color:var(--sea-green); text-decoration:none; padding:0.5rem 1rem; border-radius:8px; font-family:'Cinzel', serif; font-weight:bold; margin:0.2rem; border:none; cursor:pointer; }
        .remove-btn { background:#c62828; color:var(--on-accent); }
        .message { margin-bottom:1rem; padding:0.75rem 1rem; border-radius:8px; }
        .message.success { color:#1b5e20; background:rgba(76,175,80,0.15); }
        .message.error { color:#c62828; background:rgba(198,40,40,0.15); }
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
          <i className="fas fa-chess-rook" />
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
            <i className="fas fa-trophy" /> Tournament Management
          </motion.h1>

          <motion.div
            className="updates-section"
            custom={0}
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
          >
            {message && (
              <div className={`message ${message.type}`}>
                <i className={`fas ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`} /> {message.text}
              </div>
            )}
            <h3 style={{ fontFamily: 'Cinzel, serif', color: 'var(--sea-green)', marginBottom: '1rem' }}>{editingId ? 'Edit Tournament' : 'Add New Tournament'}</h3>
          <form onSubmit={onSubmit}>
            <div className="form-group">
              <label className="form-label">Tournament Name:</label>
              <input
                className={`form-input ${fieldErrors.tournamentName ? 'error' : ''}`}
                type="text"
                value={form.tournamentName}
                onChange={(e) => setForm({ ...form, tournamentName: e.target.value })}
                required
              />
              {fieldErrors.tournamentName && <div className="error-text">{fieldErrors.tournamentName}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Date:</label>
              <input
                className={`form-input ${fieldErrors.tournamentDate ? 'error' : ''}`}
                type="date"
                value={form.tournamentDate}
                onChange={(e) => setForm({ ...form, tournamentDate: e.target.value })}
                required
              />
              {fieldErrors.tournamentDate && <div className="error-text">{fieldErrors.tournamentDate}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Time:</label>
              <input
                className={`form-input ${fieldErrors.tournamentTime ? 'error' : ''}`}
                type="time"
                value={form.tournamentTime}
                onChange={(e) => setForm({ ...form, tournamentTime: e.target.value })}
                required
              />
              {fieldErrors.tournamentTime && <div className="error-text">{fieldErrors.tournamentTime}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Location:</label>
              <input
                className={`form-input ${fieldErrors.tournamentLocation ? 'error' : ''}`}
                type="text"
                value={form.tournamentLocation}
                onChange={(e) => setForm({ ...form, tournamentLocation: e.target.value })}
                required
              />
              {fieldErrors.tournamentLocation && <div className="error-text">{fieldErrors.tournamentLocation}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Entry Fee (₹):</label>
              <input
                className={`form-input ${fieldErrors.entryFee ? 'error' : ''}`}
                type="number"
                step="0.01"
                value={form.entryFee}
                onChange={(e) => setForm({ ...form, entryFee: e.target.value })}
                required
              />
              {fieldErrors.entryFee && <div className="error-text">{fieldErrors.entryFee}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Type:</label>
              <select
                className={`form-input ${fieldErrors.type ? 'error' : ''}`}
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                required
              >
                <option value="" disabled>Select Type</option>
                <option value="Individual">Individual</option>
                <option value="Team">Team</option>
              </select>
              {fieldErrors.type && <div className="error-text">{fieldErrors.type}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">No of Rounds:</label>
              <input
                className={`form-input ${fieldErrors.noOfRounds ? 'error' : ''}`}
                type="number"
                value={form.noOfRounds}
                onChange={(e) => setForm({ ...form, noOfRounds: e.target.value })}
                required
              />
              {fieldErrors.noOfRounds && <div className="error-text">{fieldErrors.noOfRounds}</div>}
            </div>
            <button type="submit" className="btn-primary">{editingId ? 'Update Tournament' : 'Add Tournament'}</button>
          </form>
          </motion.div>

          <motion.div
            className="updates-section"
            custom={1}
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
          >
            <h3 style={{ fontFamily: 'Cinzel, serif', color: 'var(--sea-green)', marginBottom: '0.5rem' }}>Your Tournaments</h3>
            <h4 style={{ color: 'var(--text-color)', opacity: 0.7, marginBottom: '1rem' }}>Tournaments you've submitted will appear here with their approval status</h4>

          {loading && <div>Loading tournaments…</div>}
          {!loading && !!error && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#2E8B57', fontStyle: 'italic' }}>
              <i className="fas fa-info-circle" aria-hidden="true"></i> {error}
            </div>
          )}
          {!loading && !error && activeTournaments.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#2E8B57', fontStyle: 'italic' }}>
              <i className="fas fa-info-circle" aria-hidden="true"></i> No tournaments available.
            </div>
          )}

          {!loading && !error && activeTournaments.length > 0 && (
            <>
              <div className="table-responsive">
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}><i className="fas fa-trophy" aria-hidden="true"></i> Name</th>
                    <th style={styles.th}><i className="fas fa-calendar" aria-hidden="true"></i> Date</th>
                    <th style={styles.th}>Time</th>
                    <th style={styles.th}><i className="fas fa-map-marker-alt" aria-hidden="true"></i> Location</th>
                    <th style={styles.th}><i className="fas fa-rupee-sign" aria-hidden="true"></i> Entry Fee</th>
                    <th style={styles.th}>Type</th>
                    <th style={styles.th}>No Of Rounds</th>
                    <th style={styles.th}><i className="fas fa-info-circle" aria-hidden="true"></i> Status</th>
                    <th style={styles.th}><i className="fas fa-cogs" aria-hidden="true"></i> Actions</th>
                    <th style={styles.th}><i className="fas fa-cogs" aria-hidden="true"></i> Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {activeTournaments.map((t, idx) => {
                    const { status, statusClass, dateObj } = computeStatus(t);
                    const hidden = idx >= visibleRows;
                    return (
                      <tr key={t._id || idx} style={hidden ? { display: 'none' } : undefined}>
                        <td style={styles.td}>{t.name}</td>
                        <td style={styles.td}>{isNaN(dateObj) ? '' : dateObj.toLocaleDateString()}</td>
                        <td style={styles.td}>{t.time}</td>
                        <td style={styles.td}>{t.location}</td>
                        <td style={styles.td}>₹{typeof t.entry_fee !== 'undefined' ? t.entry_fee : t.entryFee}</td>
                        <td style={styles.td}>{t.type}</td>
                        <td style={styles.td}>{typeof t.no_of_rounds !== 'undefined' ? t.no_of_rounds : t.noOfRounds}</td>
                        <td style={{ ...styles.td, ...styles.status(statusClass) }}><i className="fas fa-circle" aria-hidden="true"></i> {status}</td>
                        <td style={styles.td}>
                          {t.status === 'Approved' && (
                            <>
                              <Link to={`/coordinator/enrolled_players?tournament_id=${t._id}`} style={styles.actionBtn}>
                                <i className="fas fa-users" aria-hidden="true"></i> Players
                              </Link>
                              {t.type === 'Individual' && (
                                <>
                                  <Link to={`/coordinator/pairings?tournament_id=${t._id}&rounds=${typeof t.no_of_rounds !== 'undefined' ? t.no_of_rounds : t.noOfRounds}`} style={styles.actionBtn}>
                                    <i className="fas fa-chess-board" aria-hidden="true"></i> Pairings
                                  </Link>
                                  <Link to={`/coordinator/rankings?tournament_id=${t._id}`} style={styles.actionBtn}>
                                    <i className="fas fa-medal" aria-hidden="true"></i> Rankings
                                  </Link>
                                </>
                              )}
                            </>
                          )}
                          {/* Helpful: Edit button */}
                          <button style={styles.actionBtn} onClick={() => onEdit(t._id)}>
                            <i className="fas fa-edit" aria-hidden="true"></i> Edit
                          </button>
                        </td>
                        <td style={styles.td}>
                          <button style={styles.removeBtn} onClick={() => onRemove(t._id)}>
                            <i className="fas fa-trash" aria-hidden="true"></i> Remove
                          </button>
                          {(['Ongoing', 'Completed'].includes(status)) ? (
                            t.feedback_requested ? (
                              <a href={`/coordinator/feedback_view?tournament_id=${t._id}`} target="_blank" rel="noreferrer" style={styles.actionBtn}>
                                <i className="fas fa-eye" aria-hidden="true"></i> View Feedback
                              </a>
                            ) : (
                              <button style={styles.actionBtn} onClick={() => requestFeedback(t._id)}>
                                <i className="fas fa-paper-plane" aria-hidden="true"></i> Send Feedback Form
                              </button>
                            )
                          ) : (
                            <button style={{ ...styles.actionBtn, opacity: 0.6, cursor: 'not-allowed' }} title="Available when tournament starts" disabled>
                              <i className="fas fa-paper-plane" aria-hidden="true"></i> Send Feedback Form
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              </div>

                <div style={{ textAlign: 'center', margin: '1rem 0', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                  {visibleRows < activeTournaments.length && (
                    <button className="action-btn" onClick={() => setVisibleRows((v) => Math.min(v + ROWS_PER_PAGE, activeTournaments.length))}>
                      <i className="fas fa-trophy" /> More
                    </button>
                  )}
                  {visibleRows > ROWS_PER_PAGE && (
                    <button className="action-btn" onClick={() => setVisibleRows(ROWS_PER_PAGE)}>
                      <i className="fas fa-chevron-up" /> Hide
                    </button>
                  )}
                </div>
              </>
            )}

            <div style={{ textAlign: 'right', marginTop: '2rem' }}>
              <Link to="/coordinator/coordinator_dashboard" className="action-btn">
                <i className="fas fa-arrow-left" /> Back to Dashboard
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default TournamentManagement;
