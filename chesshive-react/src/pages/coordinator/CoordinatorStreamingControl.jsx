import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function safeTrim(v) {
  return (v == null ? '' : String(v)).trim();
}

function platformLabel(p) {
  const v = (p || '').toString();
  if (!v) return 'Other';
  if (v === 'chesscom') return 'Chess.com';
  return v.charAt(0).toUpperCase() + v.slice(1);
}

function detectPlatformFromUrl(url) {
  try {
    const u = new URL(url);
    const host = (u.hostname || '').toLowerCase();
    if (host.includes('lichess.org')) return 'lichess';
    if (host.includes('chess.com')) return 'chesscom';
    if (host.includes('youtube.com') || host.includes('youtu.be')) return 'youtube';
    if (host.includes('twitch.tv')) return 'twitch';
  } catch {
    // ignore
  }
  return null;
}

export default function CoordinatorStreamingControl() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [streams, setStreams] = useState([]);
  const [resultDrafts, setResultDrafts] = useState({});

  const [form, setForm] = useState({
    title: '',
    url: '',
    platform: 'youtube',
    matchLabel: '',
    description: '',
    isLive: true,
    featured: false,
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/coordinator/api/streams', { credentials: 'include' });
      if (!res.ok) {
        if (res.status === 401) {
          navigate('/login');
          return;
        }
        if (res.status === 403) {
          setError('Unauthorized: only coordinators can manage streams.');
          return;
        }
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json().catch(() => []);
      setStreams(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || 'Failed to load streams');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    // keep local result drafts in sync (only set when not already edited)
    setResultDrafts((prev) => {
      const next = { ...prev };
      (streams || []).forEach((s) => {
        const key = s._id;
        if (!key) return;
        if (next[key] == null) next[key] = s.result || '';
      });
      return next;
    });
  }, [streams]);

  const liveStreams = useMemo(() => (streams || []).filter(s => !!s.isLive), [streams]);
  const draftStreams = useMemo(() => (streams || []).filter(s => !s.isLive), [streams]);

  const styles = useMemo(() => ({
    page: { minHeight: '100vh', background: '#FFFDD0', fontFamily: 'Playfair Display, serif', padding: '2rem' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' },
    title: { fontFamily: 'Cinzel, serif', color: '#2E8B57', margin: 0 },
    btn: { background: '#2E8B57', color: '#fff', border: 'none', padding: '0.6rem 1rem', borderRadius: 8, cursor: 'pointer', fontFamily: 'Cinzel, serif', fontWeight: 'bold', textDecoration: 'none', display: 'inline-flex', gap: '0.5rem', alignItems: 'center' },
    btnSecondary: { background: '#87CEEB', color: '#2E8B57' },
    btnDanger: { background: '#ff4d4d', color: '#fff' },
    card: { background: '#fff', borderRadius: 15, padding: '1.25rem', border: '1px solid rgba(0,0,0,0.08)', boxShadow: 'none', marginBottom: '1rem' },
    grid: { display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' },
    row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' },
    input: { width: '100%', padding: '0.65rem', borderRadius: 10, border: '1px solid rgba(0,0,0,0.15)' },
    label: { fontFamily: 'Cinzel, serif', color: '#2E8B57', fontSize: '0.9rem' },
    error: { background: '#ffdddd', color: '#b00020', padding: '0.75rem', borderRadius: 10, border: '1px solid rgba(176,0,32,0.25)', marginBottom: '1rem' },
    muted: { opacity: 0.8 },
    pill: { padding: '0.25rem 0.6rem', borderRadius: 999, fontSize: '0.85rem', border: '1px solid rgba(0,0,0,0.12)' },
  }), []);

  const onCreate = async (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      title: safeTrim(form.title),
      url: safeTrim(form.url),
      platform: safeTrim(form.platform),
      matchLabel: safeTrim(form.matchLabel),
      description: safeTrim(form.description),
      result: '',
      isLive: !!form.isLive,
      featured: !!form.featured,
    };

    try {
      const res = await fetch('/coordinator/api/streams', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);

      setForm({ title: '', url: '', platform: 'youtube', matchLabel: '', description: '', isLive: true, featured: false });
      await load();
    } catch (e2) {
      setError(e2.message || 'Failed to create stream');
    }
  };

  const patchStream = async (id, patch) => {
    try {
      const res = await fetch(`/coordinator/api/streams/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
      await load();
    } catch (e) {
      setError(e.message || 'Failed to update stream');
    }
  };

  const deleteStream = async (id) => {
    if (!window.confirm('Delete this stream?')) return;
    try {
      const res = await fetch(`/coordinator/api/streams/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
      await load();
    } catch (e) {
      setError(e.message || 'Failed to delete stream');
    }
  };

  const StreamCard = ({ s }) => (
    <div style={styles.card}>
      <div style={styles.row}>
        <div>
          <div style={{ fontFamily: 'Cinzel, serif', color: '#2E8B57', fontSize: '1.05rem' }}>{s.title}</div>
          <div style={styles.muted}>{s.matchLabel || s.description || ''}</div>
          <div style={{ marginTop: '0.4rem', fontSize: '0.9rem', ...styles.muted }}>
            {platformLabel(s.platform)}{s.updatedAt ? ` • Updated ${new Date(s.updatedAt).toLocaleString()}` : ''}
          </div>
        </div>
        <span style={styles.pill}>{s.isLive ? 'LIVE' : (s.endedAt ? 'COMPLETED' : 'DRAFT')}</span>
      </div>

      <div style={{ marginTop: '0.75rem' }}>
        <div style={styles.label}>Result (optional, visible to players)</div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            style={{ ...styles.input, maxWidth: 520 }}
            value={resultDrafts[s._id] ?? (s.result || '')}
            onChange={(e) => setResultDrafts((p) => ({ ...p, [s._id]: e.target.value }))}
            placeholder="Example: White wins • 1-0"
          />
          <button
            style={{ ...styles.btn, ...styles.btnSecondary }}
            type="button"
            onClick={() => patchStream(s._id, { result: safeTrim(resultDrafts[s._id] ?? '') })}
          >
            <i className="fas fa-save" /> Save Result
          </button>
        </div>
      </div>

      <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <a href={s.url} target="_blank" rel="noreferrer" style={{ ...styles.btn, ...styles.btnSecondary }}>
          <i className="fas fa-external-link-alt" /> Open
        </a>

        <button style={styles.btn} onClick={() => patchStream(s._id, { isLive: !s.isLive })}>
          <i className="fas fa-broadcast-tower" /> {s.isLive ? 'Stop' : 'Go Live'}
        </button>

        {!s.isLive ? null : (
          <button
            style={{ ...styles.btn, ...styles.btnSecondary }}
            type="button"
            onClick={() => patchStream(s._id, { isLive: false, result: safeTrim(resultDrafts[s._id] ?? '') })}
          >
            <i className="fas fa-flag-checkered" /> Mark Completed
          </button>
        )}

        <button style={{ ...styles.btn, ...styles.btnSecondary }} onClick={() => patchStream(s._id, { featured: !s.featured })}>
          <i className="fas fa-star" /> {s.featured ? 'Unfeature' : 'Feature'}
        </button>

        <button style={{ ...styles.btn, ...styles.btnDanger }} onClick={() => deleteStream(s._id)}>
          <i className="fas fa-trash" /> Delete
        </button>
      </div>
    </div>
  );

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}><i className="fas fa-broadcast-tower" /> Streaming Control</h1>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button style={{ ...styles.btn, ...styles.btnSecondary }} onClick={load}><i className="fas fa-sync" /> Refresh</button>
          <Link style={styles.btn} to="/coordinator/coordinator_dashboard"><i className="fas fa-arrow-left" /> Dashboard</Link>
        </div>
      </div>

      {error && <div style={styles.error}><strong>Error:</strong> {error}</div>}

      <div style={styles.card}>
        <div style={{ fontFamily: 'Cinzel, serif', color: '#2E8B57', marginBottom: '0.75rem' }}>Create / Publish Stream</div>
        <form onSubmit={onCreate}>
          <div style={styles.grid}>
            <div>
              <div style={styles.label}>Title</div>
              <input style={styles.input} value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Example: Finals Board 1" required />
            </div>

            <div>
              <div style={styles.label}>Stream URL</div>
              <input
                style={styles.input}
                value={form.url}
                onChange={(e) => {
                  const nextUrl = e.target.value;
                  const detected = detectPlatformFromUrl(nextUrl);
                  setForm((f) => ({ ...f, url: nextUrl, platform: detected || f.platform }));
                }}
                placeholder={form.platform === 'lichess'
                  ? 'https://lichess.org/<gameId> or https://lichess.org/study/<studyId>/<chapterId>'
                  : form.platform === 'chesscom'
                    ? 'https://www.chess.com/game/live/<id> (or share URL)'
                    : 'https://youtube.com/watch?v=...'}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <div style={styles.label}>Platform</div>
                <select style={styles.input} value={form.platform} onChange={(e) => setForm(f => ({ ...f, platform: e.target.value }))}>
                  <option value="youtube">YouTube</option>
                  <option value="twitch">Twitch</option>
                  <option value="lichess">Lichess</option>
                  <option value="chesscom">Chess.com</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <div style={styles.label}>Match Label (optional)</div>
                <input style={styles.input} value={form.matchLabel} onChange={(e) => setForm(f => ({ ...f, matchLabel: e.target.value }))} placeholder="Tournament • Round • Board" />
              </div>
            </div>

            <div>
              <div style={styles.label}>Description (optional)</div>
              <input style={styles.input} value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Short note for players" />
            </div>

            <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input type="checkbox" checked={form.isLive} onChange={(e) => setForm(f => ({ ...f, isLive: e.target.checked }))} />
                <span style={styles.label}>Live now</span>
              </label>
              <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm(f => ({ ...f, featured: e.target.checked }))} />
                <span style={styles.label}>Featured</span>
              </label>
            </div>

            <div>
              <button type="submit" style={styles.btn}><i className="fas fa-plus" /> Publish</button>
            </div>
          </div>
        </form>
      </div>

      {loading ? (
        <div style={styles.card}>Loading…</div>
      ) : (
        <>
          <div style={{ fontFamily: 'Cinzel, serif', color: '#2E8B57', margin: '1rem 0 0.5rem 0' }}>Live</div>
          {liveStreams.length === 0 ? (
            <div style={styles.card}><span style={styles.muted}>No live streams.</span></div>
          ) : (
            liveStreams.map(s => <StreamCard key={s._id} s={s} />)
          )}

          <div style={{ fontFamily: 'Cinzel, serif', color: '#2E8B57', margin: '1rem 0 0.5rem 0' }}>Drafts</div>
          {draftStreams.length === 0 ? (
            <div style={styles.card}><span style={styles.muted}>No drafts.</span></div>
          ) : (
            draftStreams.map(s => <StreamCard key={s._id} s={s} />)
          )}
        </>
      )}

      <div style={styles.card}>
        <div style={{ fontFamily: 'Cinzel, serif', color: '#2E8B57' }}>Player View</div>
        <div style={{ marginTop: '0.5rem', ...styles.muted }}>
          Players will see any stream marked as <strong>Live</strong> on the Watch page.
        </div>
      </div>
    </div>
  );
}
