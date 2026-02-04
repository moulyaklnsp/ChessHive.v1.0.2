import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/playerNeoNoir.css';

function platformName(p) {
  const v = (p || '').toString();
  if (v === 'chesscom') return 'Chess.com';
  if (!v) return 'Other';
  return v.charAt(0).toUpperCase() + v.slice(1);
}

function formatWhen(d) {
  try {
    return new Date(d).toLocaleString();
  } catch {
    return '';
  }
}

export default function PlayerWatch() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [streams, setStreams] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/player/api/streams', { credentials: 'include' });
      if (!res.ok) {
        if (res.status === 401) {
          navigate('/login');
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
    const id = setInterval(load, 15000); // refresh every 15s
    return () => clearInterval(id);
  }, [load]);

  const featured = useMemo(() => (streams || []).filter(s => !!s.featured), [streams]);
  const live = useMemo(() => (streams || []).filter(s => !!s.isLive), [streams]);
  const liveNonFeatured = useMemo(() => live.filter(s => !s.featured), [live]);
  const completed = useMemo(() => (streams || []).filter(s => !s.isLive), [streams]);

  return (
    <div className="page player-neo" style={{ minHeight: '100vh' }}>
      <style>{`
        .watch-wrap{ padding:2rem; max-width:1100px; margin:0 auto; }
        .watch-header{ display:flex; align-items:center; justify-content:space-between; gap:1rem; margin-bottom:1.5rem; }
        .watch-title{ font-family:'Cinzel', serif; color:var(--sea-green); margin:0; }
        .btn{ background:var(--sea-green); color:var(--on-accent); border:none; padding:0.6rem 1rem; border-radius:8px; cursor:pointer; font-family:'Cinzel', serif; font-weight:bold; text-decoration:none; display:inline-flex; gap:0.5rem; align-items:center; }
        .btn.secondary{ background:var(--sky-blue); color:var(--on-accent); }
        .btn.ghost{ background:transparent; color:var(--sea-green); border:1px solid var(--card-border); }
        .card{ background:var(--card-bg); border:1px solid var(--card-border); border-radius:15px; padding:1.25rem; box-shadow:none; }
        .grid{ display:grid; grid-template-columns: 1fr; gap:1rem; }
        @media (min-width: 900px){ .grid{ grid-template-columns: 1fr 1fr; } }
        .muted{ opacity:0.8; }
        .row{ display:flex; justify-content:space-between; gap:1rem; align-items:center; flex-wrap:wrap; }
        .pill{ padding:0.25rem 0.6rem; border-radius:999px; font-size:0.85rem; border:1px solid var(--card-border); }
        .error{ background:#ffdddd; color:#b00020; padding:0.75rem; border-radius:10px; border:1px solid rgba(176,0,32,0.25); }

        .section-title{ font-family:'Cinzel', serif; color:var(--sea-green); margin: 0 0 0.5rem 0; }
        .mini-grid{ display:grid; grid-template-columns:1fr; gap:1rem; }
        @media (min-width: 900px){ .mini-grid{ grid-template-columns: 1fr 1fr; } }
        .tv-card{ display:flex; align-items:center; justify-content:space-between; gap:1rem; flex-wrap:wrap; }
        .tv-left{ display:flex; align-items:center; gap:0.85rem; }
        .tv-logo{ width:46px; height:46px; border-radius:12px; display:flex; align-items:center; justify-content:center; background: rgba(255,255,255,0.05); border:1px solid var(--card-border); overflow:hidden; }
        .tv-logo img{ width:28px; height:28px; object-fit:contain; }
      `}</style>

      <div className="watch-wrap">
        <div className="watch-header">
          <h1 className="watch-title"><i className="fas fa-video" /> Watch Live</h1>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="btn secondary" onClick={load}><i className="fas fa-sync" /> Refresh</button>
            <Link className="btn" to="/player/player_dashboard"><i className="fas fa-arrow-left" /> Dashboard</Link>
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <div className="section-title"><i className="fas fa-satellite-dish" style={{ marginRight: '0.5rem' }} />Live Chess TV</div>
          <div className="mini-grid">
            <div className="card">
              <div className="tv-card">
                <div className="tv-left">
                  <div className="tv-logo" aria-hidden="true"><img src="https://lichess.org/favicon.ico" alt="" /></div>
                  <div>
                    <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 800, color: 'var(--sea-green)' }}>Lichess TV</div>
                    <div className="muted" style={{ marginTop: '0.2rem' }}>Live streaming from Lichess - watch top rated games in real-time!</div>
                  </div>
                </div>
                <button className="btn" type="button" onClick={() => navigate('/player/tv/lichess')}>
                  <i className="fas fa-play" /> Watch
                </button>
              </div>
            </div>

            <div className="card">
              <div className="tv-card">
                <div className="tv-left">
                  <div className="tv-logo" aria-hidden="true"><img src="https://www.chess.com/favicon.ico" alt="" /></div>
                  <div>
                    <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 800, color: 'var(--sea-green)' }}>Chess.com TV</div>
                    <div className="muted" style={{ marginTop: '0.2rem' }}>View featured games & live streamers from Chess.com</div>
                  </div>
                </div>
                <button className="btn" type="button" onClick={() => navigate('/player/tv/chesscom')}>
                  <i className="fas fa-play" /> Watch
                </button>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="card">Loading…</div>
        ) : error ? (
          <div className="error"><strong>Error:</strong> {error}</div>
        ) : streams.length === 0 ? (
          <div className="card">
            <div style={{ fontFamily: 'Cinzel, serif', color: 'var(--sea-green)', fontSize: '1.1rem' }}>No live streams right now.</div>
            <div className="muted" style={{ marginTop: '0.5rem' }}>When a coordinator starts a broadcast, it will appear here automatically.</div>
          </div>
        ) : (
          <>
            {featured.filter(s => !!s.isLive).length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontFamily: 'Cinzel, serif', color: 'var(--sea-green)', margin: '0 0 0.5rem 0' }}>Featured</div>
                <div className="grid">
                  {featured.filter(s => !!s.isLive).map((s) => {
                    return (
                      <div key={s._id || s.url} className="card">
                        <div className="row">
                          <div>
                            <div style={{ fontFamily: 'Cinzel, serif', color: 'var(--sea-green)', fontSize: '1.05rem' }}>{s.title}</div>
                            <div className="muted" style={{ marginTop: '0.25rem' }}>{s.matchLabel || s.description || ''}</div>
                            <div className="muted" style={{ marginTop: '0.25rem', fontSize: '0.9rem' }}>{platformName(s.platform)}</div>
                          </div>
                          <span className="pill">LIVE</span>
                        </div>
                        <div className="muted" style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                          {s.createdByName ? `By ${s.createdByName}` : ''}{s.updatedAt ? ` • Updated ${formatWhen(s.updatedAt)}` : ''}
                        </div>
                        <div style={{ marginTop: '0.75rem' }}>
                          <a className="btn secondary" href={s.url} target="_blank" rel="noreferrer"><i className="fas fa-external-link-alt" /> Open</a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {liveNonFeatured.length > 0 && (
              <div>
                <div style={{ fontFamily: 'Cinzel, serif', color: 'var(--sea-green)', margin: '0 0 0.5rem 0' }}>Live Streams</div>
                <div className="grid">
                  {liveNonFeatured.map((s) => {
                    return (
                      <div key={s._id || s.url} className="card">
                        <div className="row">
                          <div>
                            <div style={{ fontFamily: 'Cinzel, serif', color: 'var(--sea-green)', fontSize: '1.05rem' }}>{s.title}</div>
                            <div className="muted" style={{ marginTop: '0.25rem' }}>{s.matchLabel || s.description || ''}</div>
                            <div className="muted" style={{ marginTop: '0.25rem', fontSize: '0.9rem' }}>{platformName(s.platform)}</div>
                          </div>
                          <span className="pill">LIVE</span>
                        </div>
                        <div className="muted" style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                          {s.createdByName ? `By ${s.createdByName}` : ''}{s.updatedAt ? ` • Updated ${formatWhen(s.updatedAt)}` : ''}
                        </div>
                        <div style={{ marginTop: '0.75rem' }}>
                          <a className="btn secondary" href={s.url} target="_blank" rel="noreferrer"><i className="fas fa-external-link-alt" /> Open</a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {completed.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <div style={{ fontFamily: 'Cinzel, serif', color: 'var(--sea-green)', margin: '0 0 0.5rem 0' }}>Recent Results</div>
                <div className="grid">
                  {completed.map((s) => (
                    <div key={s._id || s.url} className="card">
                      <div className="row">
                        <div>
                          <div style={{ fontFamily: 'Cinzel, serif', color: 'var(--sea-green)', fontSize: '1.05rem' }}>{s.title}</div>
                          <div className="muted" style={{ marginTop: '0.25rem' }}>{s.matchLabel || s.description || ''}</div>
                          <div className="muted" style={{ marginTop: '0.25rem', fontSize: '0.9rem' }}>{platformName(s.platform)}</div>
                        </div>
                        <span className="pill">COMPLETED</span>
                      </div>

                      {s.result ? (
                        <div style={{ marginTop: '0.75rem', fontWeight: 700 }}>Result: <span style={{ fontWeight: 600 }}>{s.result}</span></div>
                      ) : (
                        <div className="muted" style={{ marginTop: '0.75rem' }}>Result: (not posted yet)</div>
                      )}

                      <div className="muted" style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                        {s.endedAt ? `Ended ${formatWhen(s.endedAt)}` : (s.updatedAt ? `Updated ${formatWhen(s.updatedAt)}` : '')}
                      </div>
                      <div style={{ marginTop: '0.75rem' }}>
                        <a className="btn secondary" href={s.url} target="_blank" rel="noreferrer"><i className="fas fa-external-link-alt" /> Open</a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div style={{ marginTop: '1.5rem' }}>
          <div className="card">
            <div style={{ fontFamily: 'Cinzel, serif', color: 'var(--sea-green)' }}>Tip</div>
            <div className="muted" style={{ marginTop: '0.5rem' }}>
              Lichess games can be embedded directly. Chess.com games are usually link-only (their pages often block embedding), so players can open them in a new tab.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
