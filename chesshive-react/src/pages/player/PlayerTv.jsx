import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import '../../styles/playerNeoNoir.css';

function getProviderConfig(provider) {
  const p = (provider || '').toString().toLowerCase();
  if (p === 'lichess') {
    return {
      id: 'lichess',
      title: 'Lichess TV',
      description: 'Embedded Lichess study viewer inside ChessHive.',
      logo: 'https://lichess.org/favicon.ico'
    };
  }
  if (p === 'chesscom' || p === 'chess.com' || p === 'chess') {
    return {
      id: 'chesscom',
      title: 'Chess.com TV',
      description: 'Chess.com blocks embedding on other websites. We show a viewer attempt + safe fallback.',
      logo: 'https://www.chess.com/favicon.ico'
    };
  }
  return null;
}

export default function PlayerTv() {
  const { provider } = useParams();
  const cfg = useMemo(() => getProviderConfig(provider), [provider]);

  const lichessStudyEmbedUrl = 'https://lichess.org/study/embed/1sGpLrkI/JinVss1N?theme=wood&bg=dark';
  const chessComEmbedUrl = 'https://www.chess.com/emboard?id=10477955';

  if (!cfg) {
    return (
      <div className="page player-neo" style={{ minHeight: '100vh' }}>
        <div style={{ padding: '2rem', maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 15, padding: '1.25rem' }}>
            <div style={{ fontFamily: 'Cinzel, serif', color: 'var(--sea-green)', fontSize: '1.1rem', fontWeight: 800 }}>Unknown TV Provider</div>
            <div style={{ marginTop: '0.75rem' }}>
              <Link to="/player/watch" style={{ textDecoration: 'none', color: 'var(--sky-blue)' }}>Back to Watch</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page player-neo" style={{ minHeight: '100vh' }}>
      <style>{`
        .tv-wrap{ padding:2rem; max-width:1100px; margin:0 auto; }
        .tv-header{ display:flex; align-items:center; justify-content:space-between; gap:1rem; flex-wrap:wrap; margin-bottom:1rem; }
        .tv-title{ font-family:'Cinzel', serif; color:var(--sea-green); margin:0; display:flex; align-items:center; gap:0.75rem; }
        .btn{ background:var(--sea-green); color:var(--on-accent); border:none; padding:0.6rem 1rem; border-radius:8px; cursor:pointer; font-family:'Cinzel', serif; font-weight:bold; text-decoration:none; display:inline-flex; gap:0.5rem; align-items:center; }
        .btn.secondary{ background:var(--sky-blue); color:var(--on-accent); }
        .btn.ghost{ background:transparent; color:var(--sea-green); border:1px solid var(--card-border); }
        .card{ background:var(--card-bg); border:1px solid var(--card-border); border-radius:15px; padding:1.25rem; }
        .embed{ width:100%; height:600px; border:0; border-radius:12px; margin-top:0.75rem; background: rgba(0,0,0,0.15); }
        .muted{ opacity:0.85; }
        .logo{ width:40px; height:40px; border-radius:12px; background: rgba(255,255,255,0.05); border:1px solid var(--card-border); display:flex; align-items:center; justify-content:center; overflow:hidden; }
        .logo img{ width:24px; height:24px; object-fit:contain; }
      `}</style>

      <div className="tv-wrap">
        <div className="tv-header">
          <h1 className="tv-title">
            <span className="logo" aria-hidden="true">{cfg.logo ? <img src={cfg.logo} alt="" /> : null}</span>
            <span>{cfg.title}</span>
          </h1>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link className="btn secondary" to="/player/watch"><i className="fas fa-arrow-left" /> Back</Link>
            {cfg.id === 'chesscom' && (
              <button className="btn ghost" type="button" onClick={() => { try { window.location.href = 'https://www.chess.com/tv'; } catch (_) {} }}>
                <i className="fas fa-external-link-alt" /> Open Chess.com TV
              </button>
            )}
          </div>
        </div>

        <div className="card">
          <div className="muted">{cfg.description}</div>

          <div style={{ marginTop: '0.9rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <a
              className="btn"
              href={cfg.id === 'lichess' ? 'https://lichess.org/tv' : 'https://www.chess.com/tv'}
              target="_blank"
              rel="noreferrer"
            >
              <i className="fas fa-external-link-alt" /> Open {cfg.title}
            </a>
          </div>

          {cfg.id === 'lichess' && (
            <>
              <iframe
                className="embed"
                src={lichessStudyEmbedUrl}
                title="Lichess Study"
                frameBorder="0"
              />
            </>
          )}

          {cfg.id === 'chesscom' && (
            <>
              <iframe
                className="embed"
                src={chessComEmbedUrl}
                title="Chess.com Embed"
                width="100%"
                height="600"
                frameBorder="0"
              />
              <div className="muted" style={{ marginTop: '0.5rem' }}>
                If the embed shows blank, Chess.com may be blocking it on some browsers/networks.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
