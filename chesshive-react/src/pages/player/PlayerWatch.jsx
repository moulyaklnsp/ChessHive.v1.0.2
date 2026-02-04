import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/playerNeoNoir.css';

export default function PlayerWatch() {
  const navigate = useNavigate();

  return (
    <div className="page player-neo" style={{ minHeight: '100vh' }}>
      <style>{`
        .watch-wrap{ padding:2rem; max-width:1100px; margin:0 auto; }
        .watch-header{ display:flex; align-items:center; justify-content:space-between; gap:1rem; margin-bottom:1.5rem; flex-wrap:wrap; }
        .watch-title{ font-family:'Cinzel', serif; color:var(--sea-green); margin:0; }
        .btn{ background:var(--sea-green); color:var(--on-accent); border:none; padding:0.6rem 1rem; border-radius:8px; cursor:pointer; font-family:'Cinzel', serif; font-weight:bold; text-decoration:none; display:inline-flex; gap:0.5rem; align-items:center; transition: all 0.2s; }
        .btn:hover{ filter: brightness(1.1); transform: translateY(-1px); }
        .btn.secondary{ background:var(--sky-blue); color:var(--on-accent); }
        .btn.ghost{ background:transparent; color:var(--sea-green); border:1px solid var(--card-border); }
        .card{ background:var(--card-bg); border:1px solid var(--card-border); border-radius:15px; padding:1.25rem; box-shadow:none; }
        .muted{ opacity:0.8; }
        .section-title{ font-family:'Cinzel', serif; color:var(--sea-green); margin: 0 0 0.75rem 0; font-size: 1.2rem; }
        .mini-grid{ display:grid; grid-template-columns:1fr; gap:1rem; }
        @media (min-width: 900px){ .mini-grid{ grid-template-columns: 1fr 1fr; } }
        .tv-card{ display:flex; align-items:center; justify-content:space-between; gap:1rem; flex-wrap:wrap; }
        .tv-left{ display:flex; align-items:center; gap:0.85rem; }
        .tv-logo{ width:52px; height:52px; border-radius:12px; display:flex; align-items:center; justify-content:center; background: rgba(255,255,255,0.05); border:1px solid var(--card-border); overflow:hidden; }
        .tv-logo img{ width:32px; height:32px; object-fit:contain; }
        .feature-card{ background: linear-gradient(135deg, rgba(var(--sea-green-rgb), 0.1) 0%, var(--card-bg) 100%); }
      `}</style>

      <div className="watch-wrap">
        <div className="watch-header">
          <h1 className="watch-title"><i className="fas fa-video" /> Watch Live Chess</h1>
          <Link className="btn" to="/player/player_dashboard"><i className="fas fa-arrow-left" /> Dashboard</Link>
        </div>

        {/* Live Chess TV Section */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div className="section-title"><i className="fas fa-satellite-dish" style={{ marginRight: '0.5rem' }} />Live Chess TV</div>
          <div className="mini-grid">
            {/* Lichess TV */}
            <div className="card feature-card">
              <div className="tv-card">
                <div className="tv-left">
                  <div className="tv-logo" aria-hidden="true">
                    <img src="https://lichess.org/favicon.ico" alt="" />
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 800, color: 'var(--sea-green)', fontSize: '1.1rem' }}>
                      Lichess TV
                    </div>
                    <div className="muted" style={{ marginTop: '0.25rem' }}>
                      Stream top-rated games live in real-time!
                    </div>
                  </div>
                </div>
                <button className="btn" type="button" onClick={() => navigate('/player/tv/lichess')}>
                  <i className="fas fa-play" /> Watch
                </button>
              </div>
            </div>

            {/* Chess.com TV */}
            <div className="card feature-card">
              <div className="tv-card">
                <div className="tv-left">
                  <div className="tv-logo" aria-hidden="true">
                    <img src="https://www.chess.com/favicon.ico" alt="" />
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 800, color: 'var(--sea-green)', fontSize: '1.1rem' }}>
                      Chess.com Watch
                    </div>
                    <div className="muted" style={{ marginTop: '0.25rem' }}>
                      Top rated games & live streamers
                    </div>
                  </div>
                </div>
                <button className="btn" type="button" onClick={() => navigate('/player/tv/chesscom')}>
                  <i className="fas fa-play" /> Watch
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Access Section */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div className="section-title"><i className="fas fa-bolt" style={{ marginRight: '0.5rem' }} />Quick Access</div>
          <div className="card">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
              <button 
                className="btn ghost" 
                onClick={() => window.open('https://lichess.org/tv', 'LichessTV', 'width=900,height=700,left=100,top=100')}
                style={{ justifyContent: 'flex-start' }}
              >
                <i className="fas fa-external-link-alt" /> Lichess TV (Popup)
              </button>
              <button 
                className="btn ghost" 
                onClick={() => window.open('https://www.chess.com/play/online/watch', 'ChessComWatch', 'width=1000,height=700,left=100,top=100')}
                style={{ justifyContent: 'flex-start' }}
              >
                <i className="fas fa-crown" /> Chess.com Top Games
              </button>
              <button 
                className="btn ghost" 
                onClick={() => window.open('https://www.chess.com/events', 'ChessComEvents', 'width=1000,height=700,left=100,top=100')}
                style={{ justifyContent: 'flex-start' }}
              >
                <i className="fas fa-trophy" /> Chess.com Events
              </button>
              <button 
                className="btn ghost" 
                onClick={() => window.open('https://www.twitch.tv/chess', 'ChessTwitch', 'width=1000,height=700,left=100,top=100')}
                style={{ justifyContent: 'flex-start' }}
              >
                <i className="fab fa-twitch" /> Chess on Twitch
              </button>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="card">
          <div style={{ fontFamily: 'Cinzel, serif', color: 'var(--sea-green)', marginBottom: '0.5rem' }}>
            <i className="fas fa-info-circle" /> About Watch
          </div>
          <div className="muted" style={{ lineHeight: 1.6 }}>
            <strong>Lichess TV</strong> streams live games directly within ChessHive using their real-time API. 
            You can watch top-rated games, bullet, blitz, rapid, and classical channels.
            <br /><br />
            <strong>Chess.com Watch</strong> opens in a convenient popup window since they don't allow embedding. 
            You can watch top-rated games, events, and live streamers.
          </div>
        </div>
      </div>
    </div>
  );
}
