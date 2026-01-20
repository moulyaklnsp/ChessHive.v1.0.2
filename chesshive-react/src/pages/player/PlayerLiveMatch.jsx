import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import usePlayerTheme from '../../hooks/usePlayerTheme';
import { getOrCreateSharedSocket } from '../../utils/socket';

const SOCKET_IO_PATH = '/socket.io/socket.io.js';
const CHESS_JS_CDN = 'https://cdn.jsdelivr.net/npm/chess.js@1.0.0/chess.min.js';

function clamp(n, min, max) {
  const x = Number(n);
  if (Number.isNaN(x)) return min;
  return Math.max(min, Math.min(max, x));
}

function formatClock(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function fenToBoard(ChessCtor, fen) {
  if (!ChessCtor) return Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => null));
  try {
    const game = new ChessCtor(fen === 'start' ? undefined : fen);
    const b = game.board(); // 8x8 array, rank 8 -> 1
    return b;
  } catch {
    return Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => null));
  }
}

function pieceToUnicode(piece) {
  if (!piece) return '';
  const key = `${piece.color}${piece.type}`;
  switch (key) {
    case 'wp': return '♙';
    case 'wn': return '♘';
    case 'wb': return '♗';
    case 'wr': return '♖';
    case 'wq': return '♕';
    case 'wk': return '♔';
    case 'bp': return '♟';
    case 'bn': return '♞';
    case 'bb': return '♝';
    case 'br': return '♜';
    case 'bq': return '♛';
    case 'bk': return '♚';
    default: return '';
  }
}

function squareName(fileIndex, rankIndex) {
  // fileIndex: 0..7 => a..h
  // rankIndex: 0..7 => 8..1
  const file = String.fromCharCode('a'.charCodeAt(0) + fileIndex);
  const rank = (8 - rankIndex).toString();
  return `${file}${rank}`;
}

/*
export default function PlayerLiveMatch() {
  const routerLocation = useLocation();
  const navigate = useNavigate();
  const [isDark, toggleTheme] = usePlayerTheme();

  const [socketReady, setSocketReady] = useState(typeof window !== 'undefined' && !!window.io);
  const socketRef = useRef(null);

  const ChessCtorRef = useRef(null);
  const [chessReady, setChessReady] = useState(false);

  const [username, setUsername] = useState('');
  const [roleLabel, setRoleLabel] = useState('Player');

  // Request settings
  const [minutes, setMinutes] = useState(60);
  const [increment, setIncrement] = useState(0);
  const [colorPref, setColorPref] = useState('random'); // white | black | random

  // Player search + direct request
  const [toast, setToast] = useState('');
  const toastTimerRef = useRef(null);
  const [onlineUsers, setOnlineUsers] = useState([]); // [{username, role}]
  const [playerSearch, setPlayerSearch] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [incomingInvite, setIncomingInvite] = useState(null); // { inviteId, from, baseMs, incMs, colorPref }
  const [inviteResult, setInviteResult] = useState('');
  const baseMs = useMemo(() => clamp(minutes, 60, 120) * 60 * 1000, [minutes]);
  const incMsExpanded = useMemo(() => clamp(increment, 0, 90) * 1000, [increment]);

  // Match state
    if ((username || '').trim()) {
      try { sock.emit('join', { username: (username || '').trim(), role: roleLabel || 'Player' }); } catch (_) {}
    }
  const [status, setStatus] = useState('idle'); // idle | queued | playing
  const [room, setRoom] = useState('');
  const [myColor, setMyColor] = useState('white');
  const [opponent, setOpponent] = useState('');

  const [fen, setFen] = useState('start');
  const [selectedSq, setSelectedSq] = useState(null);

  // Clock state (ms)
  const [whiteMs, setWhiteMs] = useState(5 * 60 * 1000);
  const [blackMs, setBlackMs] = useState(5 * 60 * 1000);
  const lastTickAtRef = useRef(null);
  const baseMs = useMemo(() => clamp(minutes, 60, 120) * 60 * 1000, [minutes]);
  const incMsExpanded = useMemo(() => clamp(increment, 0, 90) * 1000, [increment]);
      const base = typeof p.baseMs === 'number' ? p.baseMs : clamp(minutes, 60, 120) * 60 * 1000;
  const activeTurn = useMemo(() => {
    if (!ChessCtorRef.current) return 'w';
    try {
      const g = new ChessCtorRef.current(fen === 'start' ? undefined : fen);
      return g.turn();
    } catch {
      return 'w';
    sock.on('matchRequestSent', () => {
      setToast('Request sent');
    });
    }
  }, [fen]);

  const myTurn = useMemo(() => {
    if (myColor === 'white') return activeTurn === 'w';
    return activeTurn === 'b';
  }, [myColor, activeTurn]);

  const running = status === 'playing';

  // Load Socket.IO client script dynamically
  useEffect(() => {
    if (window.io) {
      setSocketReady(true);
      return;
    }
    const script = document.createElement('script');
    script.src = SOCKET_IO_PATH;
    script.async = true;
    script.onload = () => setSocketReady(true);
    script.onerror = () => setSocketReady(false);
    document.body.appendChild(script);
    return () => {
      try { document.body.removeChild(script); } catch (_) {}
    };
  }, []);

  // Load chess.js dynamically
  useEffect(() => {
    if (ChessCtorRef.current) {
      setChessReady(true);
  useEffect(() => {
    if (!toast) return;
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(''), 2500);
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, [toast]);
      return;
    }
    const base = clamp(minutes, 60, 120) * 60 * 1000;
    const inc = clamp(increment, 0, 90) * 1000;
    script.async = true;
    script.onload = () => {
      ChessCtorRef.current = window.Chess;
      setChessReady(true);
    };
    script.onerror = () => setChessReady(false);
    socketRef.current.emit('matchRequest', { username: name, baseMs: base, incMs: inc, colorPref });
    setToast('Request sent');
    return () => {
      try { document.body.removeChild(script); } catch (_) {}
    };
  }, []);

  // Prefill username from session
  useEffect(() => {
    fetch('/api/session', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d && d.username) setUsername(d.username);
        if (d && d.userRole) setRoleLabel(d.userRole.charAt(0).toUpperCase() + d.userRole.slice(1));
      })
      .catch(() => {});
  }, []);

  // Connect socket and listeners
  useEffect(() => {
    if (!socketReady || !window.io) return;
    if (socketRef.current) return;

    const sock = window.io();
    socketRef.current = sock;

    sock.on('matchQueued', () => {
      setStatus('queued');
    });
        {!!toast && (
          <div style={{ position: 'fixed', top: 18, right: 18, zIndex: 2000, background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '10px 12px', borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}>
            <div style={{ fontWeight: 700, color: 'var(--sea-green)' }}>{toast}</div>
          </div>
        )}

    sock.on('updateUsers', (users) => {
      if (Array.isArray(users)) setOnlineUsers(users);
    });

    sock.on('matchFound', (payload) => {
            {incomingInvite && (
              <div style={{ marginBottom: '0.75rem', padding: '0.75rem', borderRadius: 12, border: '1px solid var(--card-border)', background: 'var(--content-bg)' }}>
                <div style={{ fontWeight: 800, color: 'var(--sky-blue)' }}>Incoming match request</div>
                <div style={{ marginTop: 6, opacity: 0.9 }}>
                  From: <strong>{incomingInvite.from}</strong> — Time: <strong>{Math.round((incomingInvite.baseMs || baseMs) / 60000)}+{Math.round((incomingInvite.incMs || incMsExpanded) / 1000)}</strong> — Color: <strong>{incomingInvite.colorPref}</strong>
                </div>
                <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={() => {
                      if (!socketRef.current) return;
                      socketRef.current.emit('matchInviteAccept', { inviteId: incomingInvite.inviteId });
                      setIncomingInvite(null);
                    }}
                    style={{ background: 'var(--sea-green)', color: 'var(--on-accent)', border: 'none', padding: '10px 14px', borderRadius: 10, cursor: 'pointer', fontFamily: 'Cinzel, serif', fontWeight: 'bold' }}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => {
                      if (!socketRef.current) return;
                      socketRef.current.emit('matchInviteDecline', { inviteId: incomingInvite.inviteId });
                      setIncomingInvite(null);
                      setToast('Declined');
                    }}
                    style={{ background: 'transparent', color: 'var(--sea-green)', border: '2px solid var(--sea-green)', padding: '10px 14px', borderRadius: 10, cursor: 'pointer', fontFamily: 'Cinzel, serif', fontWeight: 'bold' }}
                  >
                    Decline
                  </button>
                </div>
              </div>
            )}
      const p = payload || {};
      setRoom(p.room || '');
      setMyColor(p.color || 'white');
      setOpponent(p.opponent || '');

                  min={60}
                  max={120}
      setBlackMs(base);
                  onChange={(e) => setMinutes(clamp(e.target.value, 60, 120))}
      setSelectedSq(null);
      lastTickAtRef.current = Date.now();

      if (p.room) {
        sock.emit('chessJoin', { room: p.room });
      }
      setStatus('playing');
    });

                  max={90}
      const p = payload || {};
                  onChange={(e) => setIncrement(clamp(e.target.value, 0, 90))}
      setIncomingInvite({ from: p.from, baseMs: p.baseMs, incMs: p.incMs, colorPref: p.colorPref });
    });

    sock.on('matchInviteResult', (payload) => {
      const p = payload || {};
      if (p.ok) setInviteResult('Request sent. Waiting for acceptance…');
      else setInviteResult(p.reason ? `Request failed: ${p.reason}` : 'Request failed');
      setTimeout(() => setInviteResult(''), 4000);
    });

    sock.on('matchInviteDeclined', (payload) => {
      const p = payload || {};
      setInviteResult(p.by ? `Request declined by ${p.by}` : 'Request declined');
      setTimeout(() => setInviteResult(''), 4000);
    });

    sock.on('chessMove', (move) => {
      const m = move || {};
      if (m.fen) setFen(m.fen);
      if (typeof m.whiteMs === 'number') setWhiteMs(m.whiteMs);
      if (typeof m.blackMs === 'number') setBlackMs(m.blackMs);
      lastTickAtRef.current = Date.now();
      setSelectedSq(null);
    });

    sock.on('matchCancelled', () => {
      setStatus('idle');
      setRoom('');
      setOpponent('');
    });

    sock.on('matchOpponentLeft', () => {
      alert('Opponent left the match.');
      setStatus('idle');
      setRoom('');
      setOpponent('');
      setFen('start');
      setSelectedSq(null);
    });

    return () => {
      try {
        sock.off('matchQueued');
        sock.off('updateUsers');
        sock.off('matchFound');
        sock.off('chessMove');
        sock.off('matchInvite');
        sock.off('matchInviteResult');
        sock.off('matchInviteDeclined');
        sock.off('matchCancelled');
        sock.off('matchOpponentLeft');
        sock.disconnect();
      } catch (_) {}
      socketRef.current = null;
    };
  }, [socketReady, minutes]);

  // Clock tick
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => {
      if (!lastTickAtRef.current) lastTickAtRef.current = Date.now();
      const now = Date.now();
      const dt = now - lastTickAtRef.current;
      if (dt <= 0) return;
      lastTickAtRef.current = now;

      if (activeTurn === 'w') setWhiteMs((prev) => Math.max(0, prev - dt));
      else setBlackMs((prev) => Math.max(0, prev - dt));
    }, 200);
    return () => clearInterval(timer);
  }, [running, activeTurn]);

  const sendMatchRequest = () => {
    if (!socketRef.current) return;
    const baseMs = clamp(minutes, 60, 120) * 60 * 1000;
    const inc = clamp(increment, 0, 90) * 1000;
    const name = (username || '').trim();
    const target = (selectedPlayer || '').trim();
    
    if (!name) {
      alert('Username not found. Please login again.');
      return;
    }
    if (!target) {
      alert('Please search and select a player first.');
      return;
    }
    
    setInviteResult('');
    socketRef.current.emit('join', { username: name, role: roleLabel || 'Player' });
    socketRef.current.emit('matchDirectRequest', { username: name, targetUsername: target, baseMs, incMs: inc, colorPref });
    setToast(`Match request sent to ${target}`);
  };

  const cancelRequest = () => {
    if (!socketRef.current) return;
    socketRef.current.emit('matchCancel');
    setSelectedPlayer('');
    setPlayerSearch('');
  };

  const acceptInvite = () => {
    if (!socketRef.current || !incomingInvite) return;
    const name = (username || '').trim();
    if (!name) return;
    socketRef.current.emit('join', { username: name, role: roleLabel || 'Player' });
    socketRef.current.emit('matchInviteAccept', { fromUsername: incomingInvite.from });
    setIncomingInvite(null);
  };

  const declineInvite = () => {
    if (!socketRef.current || !incomingInvite) return;
    socketRef.current.emit('matchInviteDecline', { fromUsername: incomingInvite.from });
    setIncomingInvite(null);
  };

  const tryMove = (from, to) => {
    if (!socketRef.current || !room) return;
    if (!chessReady || !ChessCtorRef.current) return;
    if (!myTurn) return;

    const now = Date.now();
    if (!lastTickAtRef.current) lastTickAtRef.current = now;
    const dt = now - lastTickAtRef.current;

    let nextWhite = whiteMs;
    let nextBlack = blackMs;
    if (activeTurn === 'w') nextWhite = Math.max(0, nextWhite - dt);
    else nextBlack = Math.max(0, nextBlack - dt);

    try {
      const game = new ChessCtorRef.current(fen === 'start' ? undefined : fen);
      const result = game.move({ from, to, promotion: 'q' });
      if (!result) return;

      // increment for player who just moved
      if (activeTurn === 'w') nextWhite += incMs;
      else nextBlack += incMs;

      const newFen = game.fen();
      setFen(newFen);
      setWhiteMs(nextWhite);
      setBlackMs(nextBlack);
      lastTickAtRef.current = Date.now();

      socketRef.current.emit('chessMove', {
        room,
        move: {
          from,
          to,
          fen: newFen,
          by: username,
          whiteMs: nextWhite,
          blackMs: nextBlack
        }
      });
    } catch {
      // ignore
    }
  };

  const onCellClick = (sq) => {
    if (status !== 'playing') return;
    if (!myTurn) return;

    if (!selectedSq) {
      setSelectedSq(sq);
      return;
    }

    if (selectedSq === sq) {
      setSelectedSq(null);
      return;
    }

    const from = selectedSq;
    const to = sq;
    setSelectedSq(null);
    tryMove(from, to);
  };

  const displayBoard = useMemo(() => {
    // board is rank 8 -> 1, file a -> h
    if (myColor !== 'black') return board;
    // flip for black orientation
    const flipped = board.slice().reverse().map((row) => row.slice().reverse());
    return flipped;
  }, [board, myColor]);

  const squareForDisplay = (rowIndex, colIndex) => {
    if (myColor !== 'black') return squareName(colIndex, rowIndex);
    // In flipped display, rowIndex 0 corresponds to original rank 1, colIndex 0 corresponds to original file h
    const originalRow = 7 - rowIndex;
    const originalCol = 7 - colIndex;
    return squareName(originalCol, originalRow);
  };

  return (
    <div className="page player-neo" style={{ minHeight: '100vh' }}>
      <div style={{ width: '100%', padding: '1.5rem', color: 'var(--text-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
          <h1 style={{ margin: 0, fontFamily: 'Cinzel, serif', color: 'var(--sea-green)' }}>
            Live Match
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={toggleTheme}
              style={{ background: 'transparent', border: '2px solid var(--sea-green)', color: 'var(--sea-green)', padding: '8px 12px', borderRadius: 8, cursor: 'pointer', fontFamily: 'Cinzel, serif', fontWeight: 'bold' }}
            >
              {isDark ? 'Switch to Light' : 'Switch to Dark'}
            </button>
            <button
              onClick={() => navigate('/player/player_dashboard')}
              style={{ background: 'transparent', border: '2px solid var(--sky-blue)', color: 'var(--sky-blue)', padding: '8px 12px', borderRadius: 8, cursor: 'pointer', fontFamily: 'Cinzel, serif', fontWeight: 'bold' }}
            >
              Back
            </button>
          </div>
        </div>

        {status !== 'playing' && (
          <div style={{ maxWidth: 720, background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 14, padding: '1rem' }}>
            <div style={{ fontWeight: 700, marginBottom: '1rem', color: 'var(--sea-green)', fontSize: '1.1rem' }}>Start a Live Match</div>
            
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Search for a Player</label>
              <input
                type="text"
                value={playerSearch}
                onChange={(e) => {
                  setPlayerSearch(e.target.value);
                  setShowSearchDropdown(true);
                }}
                onFocus={() => setShowSearchDropdown(true)}
                placeholder="Type player username to search..."
                disabled={status === 'queued'}
                style={{ 
                  width: '100%', 
                  padding: '12px 14px', 
                  borderRadius: 10, 
                  border: '2px solid var(--sky-blue)', 
                  background: 'var(--content-bg)', 
                  color: 'var(--text-color)',
                  fontSize: '1rem',
                  fontWeight: 500
                }}
              />
              
              {showSearchDropdown && playerSearch && (
                <div style={{ 
                  position: 'absolute', 
                  top: '100%', 
                  left: 0, 
                  right: 0, 
                  maxHeight: 240, 
                  overflow: 'auto', 
                  border: '2px solid var(--sky-blue)', 
                  borderTop: 'none',
                  borderRadius: '0 0 10px 10px', 
                  background: 'var(--content-bg)',
                  zIndex: 100,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}>
                  {(() => {
                    const q = (playerSearch || '').toLowerCase().trim();
                    const list = (onlineUsers || [])
                      .filter(u => u && u.username)
                      .filter(u => (u.role || '').toString().toLowerCase() === 'player')
                      .filter(u => u.username !== username)
                      .filter(u => u.username.toLowerCase().includes(q));
                    
                    if (list.length === 0) {
                      return <div style={{ padding: '1rem', opacity: 0.7, textAlign: 'center' }}>No players found</div>;
                    }
                    
                    return list.slice(0, 20).map((u) => (
                      <button
                        key={u.username}
                        onClick={() => {
                          setSelectedPlayer(u.username);
                          setPlayerSearch(u.username);
                          setShowSearchDropdown(false);
                        }}
                        style={{ 
                          width: '100%', 
                          textAlign: 'left', 
                          padding: '0.8rem 1rem', 
                          border: 'none', 
                          background: selectedPlayer === u.username ? 'rgba(135,206,235,0.2)' : 'transparent', 
                          color: 'var(--text-color)', 
                          cursor: 'pointer', 
                          borderBottom: '1px solid rgba(255,255,255,0.06)',
                          transition: 'background 0.2s',
                          fontWeight: 500
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(135,206,235,0.15)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = selectedPlayer === u.username ? 'rgba(135,206,235,0.2)' : 'transparent'}
                      >
                        <i className="fas fa-user" style={{ marginRight: 8, opacity: 0.7 }}></i>
                        {u.username}
                      </button>
                    ));
                  })()}
                </div>
              )}
            </div>

            {selectedPlayer && (
              <div style={{ 
                marginBottom: '1rem', 
                padding: '0.75rem', 
                borderRadius: 10, 
                background: 'rgba(135,206,235,0.1)', 
                border: '1px solid var(--sky-blue)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <span style={{ fontWeight: 600, color: 'var(--sky-blue)' }}>Selected Player:</span>{' '}
                  <strong>{selectedPlayer}</strong>
                </div>
                <button
                  onClick={() => {
                    setSelectedPlayer('');
                    setPlayerSearch('');
                  }}
                  style={{ 
                    background: 'transparent', 
                    border: 'none', 
                    color: 'var(--text-color)', 
                    cursor: 'pointer',
                    opacity: 0.7,
                    fontSize: '1.2rem'
                  }}
                  title="Clear selection"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Time (minutes)</label>
                <input
                  type="number"
                  min={60}
                  max={120}
                  value={minutes}
                  onChange={(e) => setMinutes(clamp(e.target.value, 60, 120))}
                  disabled={status === 'queued'}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--card-border)', background: 'var(--content-bg)', color: 'var(--text-color)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Increment (seconds)</label>
                <input
                  type="number"
                  min={0}
                  max={90}
                  value={increment}
                  onChange={(e) => setIncrement(clamp(e.target.value, 0, 90))}
                  disabled={status === 'queued'}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--card-border)', background: 'var(--content-bg)', color: 'var(--text-color)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Color</label>
                <select
                  value={colorPref}
                  onChange={(e) => setColorPref(e.target.value)}
                  disabled={status === 'queued'}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--card-border)', background: 'var(--content-bg)', color: 'var(--text-color)' }}
                >
                  <option value="random">Random</option>
                  <option value="white">White</option>
                  <option value="black">Black</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {status !== 'queued' ? (
                <button
                  onClick={sendMatchRequest}
                  disabled={!socketReady || !chessReady || !selectedPlayer}
                  style={{ 
                    background: selectedPlayer ? 'var(--sea-green)' : 'rgba(0,128,128,0.3)', 
                    color: selectedPlayer ? 'var(--on-accent)' : 'rgba(255,255,255,0.5)', 
                    border: 'none', 
                    padding: '12px 18px', 
                    borderRadius: 10, 
                    cursor: selectedPlayer ? 'pointer' : 'not-allowed', 
                    fontFamily: 'Cinzel, serif', 
                    fontWeight: 'bold',
                    fontSize: '1rem'
                  }}
                >
                  <i className="fas fa-paper-plane" style={{ marginRight: 8 }}></i>
                  Send Match Request
                </button>
              ) : (
                <button
                  onClick={cancelRequest}
                  style={{ background: 'transparent', color: 'var(--sea-green)', border: '2px solid var(--sea-green)', padding: '12px 18px', borderRadius: 10, cursor: 'pointer', fontFamily: 'Cinzel, serif', fontWeight: 'bold' }}
                >
                  <i className="fas fa-times" style={{ marginRight: 8 }}></i>
                  Cancel Request
                </button>
              )}

              <div style={{ alignSelf: 'center', opacity: 0.85 }}>
                {!socketReady ? 'Loading live server…' : (!chessReady ? 'Loading chess engine…' : (status === 'queued' ? 'Waiting for response…' : ''))}
              </div>
            </div>

            {inviteResult && (
              <div style={{ marginTop: '0.75rem', padding: '0.75rem', borderRadius: 10, border: '1px solid var(--card-border)', background: 'var(--content-bg)' }}>
                {inviteResult}
              </div>
            )}

            {incomingInvite && (
              <div style={{ marginTop: '0.75rem', padding: '0.75rem', borderRadius: 12, border: '1px solid var(--card-border)', background: 'var(--content-bg)' }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Match request from {incomingInvite.from}</div>
                <div style={{ opacity: 0.85, marginBottom: 10 }}>
                  Time control: {Math.round((incomingInvite.baseMs || 0) / 60000)}+{Math.round((incomingInvite.incMs || 0) / 1000)} • Requested color: {(incomingInvite.colorPref || 'random')}
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={acceptInvite}
                    style={{ background: 'var(--sea-green)', color: 'var(--on-accent)', border: 'none', padding: '10px 14px', borderRadius: 10, cursor: 'pointer', fontFamily: 'Cinzel, serif', fontWeight: 'bold' }}
                  >
                    Accept
                  </button>
                  <button
                    onClick={declineInvite}
                    style={{ background: 'transparent', color: 'var(--sea-green)', border: '2px solid var(--sea-green)', padding: '10px 14px', borderRadius: 10, cursor: 'pointer', fontFamily: 'Cinzel, serif', fontWeight: 'bold' }}
                  >
                    Decline
                  </button>
                </div>
              </div>
            )}

            <div style={{ marginTop: '0.75rem', opacity: 0.85 }}>
              Logged in as: <strong>{username || '...'}</strong>
            </div>
          </div>
        )}

        {status === 'playing' && (
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 14, padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--sky-blue)' }}>{opponent ? `Opponent: ${opponent}` : 'Opponent'}</div>
                  <div style={{ opacity: 0.85 }}>You: {username || 'Player'} ({myColor})</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'Cinzel, serif', color: 'var(--sea-green)' }}>{formatClock(myColor === 'white' ? whiteMs : blackMs)}</div>
                  <div style={{ opacity: 0.85 }}>Your time</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 52px)', gridTemplateRows: 'repeat(8, 52px)', border: '2px solid var(--card-border)' }}>
                {displayBoard.map((row, r) =>
                  row.map((piece, c) => {
                    const sq = squareForDisplay(r, c);
                    const isSelected = selectedSq === sq;
                    const light = (r + c) % 2 === 0;
                    return (
                      <button
                        key={`${r}-${c}`}
                        onClick={() => onCellClick(sq)}
                        style={{
                          width: 52,
                          height: 52,
                          padding: 0,
                          border: 'none',
                          cursor: myTurn ? 'pointer' : 'not-allowed',
                          background: isSelected ? 'rgba(135,206,235,0.35)' : (light ? '#f0d9b5' : '#b58863'),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 30,
                          lineHeight: 1
                        }}
                        disabled={!myTurn}
                        aria-label={sq}
                      >
                        {pieceToUnicode(piece)}
                      </button>
                    );
                  })
                )}
              </div>

              <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                <div style={{ opacity: 0.85 }}>Turn: <strong>{activeTurn === 'w' ? 'White' : 'Black'}</strong></div>
                <div style={{ opacity: 0.85 }}>Room: <strong>{room}</strong></div>
              </div>
            </div>

            <div style={{ minWidth: 280, background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 14, padding: '1rem' }}>
              <div style={{ fontWeight: 700, marginBottom: 8, color: 'var(--sea-green)' }}>Clocks</div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>White</div>
                <div style={{ fontFamily: 'Cinzel, serif' }}>{formatClock(whiteMs)}</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>Black</div>
                <div style={{ fontFamily: 'Cinzel, serif' }}>{formatClock(blackMs)}</div>
              </div>

              <div style={{ marginTop: '1rem', opacity: 0.85 }}>
                Time control: <strong>{clamp(minutes, 60, 120)}+{clamp(increment, 0, 90)}</strong>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <button
                  onClick={() => {
                    if (!socketRef.current) return;
                    try { socketRef.current.emit('matchLeave'); } catch (_) {}
                    setStatus('idle');
                    setRoom('');
                    setOpponent('');
                    setFen('start');
                    setSelectedSq(null);
                  }}
                  style={{ background: 'transparent', border: '2px solid var(--sea-green)', color: 'var(--sea-green)', padding: '10px 14px', borderRadius: 10, cursor: 'pointer', fontFamily: 'Cinzel, serif', fontWeight: 'bold', width: '100%' }}
                >
                  Leave Match
                </button>
              </div>

              <div style={{ marginTop: '0.75rem' }}>
                <Link to="/player/player_dashboard" style={{ textDecoration: 'none', color: 'var(--sky-blue)' }}>
                  Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

*/

export default function PlayerLiveMatch() {
  const routerLocation = useLocation();
  const navigate = useNavigate();
  const [isDark, toggleTheme] = usePlayerTheme();

  const [socketReady, setSocketReady] = useState(typeof window !== 'undefined' && !!window.io);
  const socketRef = useRef(null);

  const ChessCtorRef = useRef(null);
  const [chessReady, setChessReady] = useState(false);

  const [username, setUsername] = useState('');
  const [roleLabel, setRoleLabel] = useState('Player');

  // Request settings
  const [minutes, setMinutes] = useState(60);
  const [increment, setIncrement] = useState(0);
  const [colorPref, setColorPref] = useState('random');

  // UI
  const [toast, setToast] = useState('');
  const toastTimerRef = useRef(null);
  const inviteResultTimerRef = useRef(null);

  // Player search + direct request
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [playerSearch, setPlayerSearch] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [incomingInvite, setIncomingInvite] = useState(null); // { inviteId?, from, baseMs, incMs, colorPref }
  const [inviteResult, setInviteResult] = useState('');
  const [playOpen, setPlayOpen] = useState(false);

  // Match state
  const [status, setStatus] = useState('idle');
  const [room, setRoom] = useState('');
  const [myColor, setMyColor] = useState('white');
  const [opponent, setOpponent] = useState('');
  const [fen, setFen] = useState('start');
  const [selectedSq, setSelectedSq] = useState(null);

  // Derived
  const baseMs = useMemo(() => clamp(minutes, 60, 120) * 60 * 1000, [minutes]);
  const incMs = useMemo(() => clamp(increment, 0, 90) * 1000, [increment]);

  // Clocks
  const [whiteMs, setWhiteMs] = useState(baseMs);
  const [blackMs, setBlackMs] = useState(baseMs);
  const lastTickAtRef = useRef(null);

  const board = useMemo(() => {
    if (!chessReady) return Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => null));
    return fenToBoard(ChessCtorRef.current, fen);
  }, [fen, chessReady]);

  const activeTurn = useMemo(() => {
    if (!ChessCtorRef.current) return 'w';
    try {
      const g = new ChessCtorRef.current(fen === 'start' ? undefined : fen);
      return g.turn();
    } catch {
      return 'w';
    }
  }, [fen]);

  const myTurn = useMemo(() => {
    if (myColor === 'white') return activeTurn === 'w';
    return activeTurn === 'b';
  }, [myColor, activeTurn]);

  const running = status === 'playing';

  // Load Socket.IO client script dynamically
  useEffect(() => {
    if (window.io) {
      setSocketReady(true);
      return;
    }
    const script = document.createElement('script');
    script.src = SOCKET_IO_PATH;
    script.async = true;
    script.onload = () => setSocketReady(true);
    script.onerror = () => setSocketReady(false);
    document.body.appendChild(script);
    return () => {
      try { document.body.removeChild(script); } catch (_) {}
    };
  }, []);

  // Load chess.js dynamically
  useEffect(() => {
    if (ChessCtorRef.current || window.Chess) {
      ChessCtorRef.current = window.Chess;
      setChessReady(!!ChessCtorRef.current);
      return;
    }
    const script = document.createElement('script');
    script.src = CHESS_JS_CDN;
    script.async = true;
    script.onload = () => {
      ChessCtorRef.current = window.Chess;
      setChessReady(!!ChessCtorRef.current);
    };
    script.onerror = () => setChessReady(false);
    document.body.appendChild(script);
    return () => {
      try { document.body.removeChild(script); } catch (_) {}
    };
  }, []);

  // Toast auto-clear
  useEffect(() => {
    if (!toast) return undefined;
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(''), 2500);
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, [toast]);

  // Prefill username from session
  useEffect(() => {
    fetch('/api/session', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d && d.username) setUsername(d.username);
        if (d && d.userRole) setRoleLabel(d.userRole.charAt(0).toUpperCase() + d.userRole.slice(1));
      })
      .catch(() => {});
  }, []);

  // Connect socket and listeners
  useEffect(() => {
    if (!socketReady || !window.io) return undefined;
    if (socketRef.current) return undefined;

    const sock = window.__chesshiveLiveSocket || getOrCreateSharedSocket('__chesshiveLiveSocket');
    if (!sock) return undefined;
    window.__chesshiveLiveSocket = sock;
    socketRef.current = sock;

    sock.on('matchQueued', () => setStatus('queued'));

    sock.on('updateUsers', (users) => {
      if (Array.isArray(users)) setOnlineUsers(users);
    });

    sock.on('matchRequestSent', () => setToast('Request sent'));

    sock.on('matchInvite', (payload) => {
      const p = payload || {};
      setIncomingInvite({
        inviteId: p.inviteId,
        from: p.from,
        baseMs: p.baseMs,
        incMs: p.incMs,
        colorPref: p.colorPref || 'random'
      });
      setToast('New match request');
      setPlayOpen(true);
    });

    sock.on('matchInviteResult', (payload) => {
      const p = payload || {};
      if (p.ok) setInviteResult('Request sent. Waiting for acceptance…');
      else setInviteResult(p.reason ? `Request failed: ${p.reason}` : 'Request failed');
      if (inviteResultTimerRef.current) clearTimeout(inviteResultTimerRef.current);
      inviteResultTimerRef.current = setTimeout(() => setInviteResult(''), 4000);
    });

    sock.on('matchInviteDeclined', (payload) => {
      const p = payload || {};
      setInviteResult(p.by ? `Request declined by ${p.by}` : 'Request declined');
      if (inviteResultTimerRef.current) clearTimeout(inviteResultTimerRef.current);
      inviteResultTimerRef.current = setTimeout(() => setInviteResult(''), 4000);
    });

    sock.on('matchInviteCancelled', (payload) => {
      const p = payload || {};
      const reason = p.reason ? ` (${p.reason})` : '';
      setInviteResult(`Invite cancelled${reason}`);
      if (inviteResultTimerRef.current) clearTimeout(inviteResultTimerRef.current);
      inviteResultTimerRef.current = setTimeout(() => setInviteResult(''), 4000);
    });

    sock.on('matchFound', (payload) => {
      const p = payload || {};
      const base = typeof p.baseMs === 'number' ? p.baseMs : baseMs;
      const inc = typeof p.incMs === 'number' ? p.incMs : incMs;

      setRoom(p.room || '');
      setMyColor(p.color || 'white');
      setOpponent(p.opponent || '');

      setFen('start');
      setSelectedSq(null);
      setWhiteMs(base);
      setBlackMs(base);
      lastTickAtRef.current = Date.now();

      setIncomingInvite(null);
      setPlayOpen(false);
      setStatus('playing');

      if (p.room) {
        try { sock.emit('chessJoin', { room: p.room }); } catch (_) {}
      }

      const baseMinutes = Math.round(base / 60000);
      const incSeconds = Math.round(inc / 1000);
      if (Number.isFinite(baseMinutes)) setMinutes(clamp(baseMinutes, 60, 120));
      if (Number.isFinite(incSeconds)) setIncrement(clamp(incSeconds, 0, 90));
    });

    sock.on('chessMove', (move) => {
      const m = move || {};
      if (m.fen) setFen(m.fen);
      if (typeof m.whiteMs === 'number') setWhiteMs(m.whiteMs);
      if (typeof m.blackMs === 'number') setBlackMs(m.blackMs);
      lastTickAtRef.current = Date.now();
      setSelectedSq(null);
    });

    sock.on('matchCancelled', () => {
      setStatus('idle');
      setRoom('');
      setOpponent('');
    });

    sock.on('matchOpponentLeft', () => {
      alert('Opponent left the match.');
      setStatus('idle');
      setRoom('');
      setOpponent('');
      setFen('start');
      setSelectedSq(null);
    });

    return () => {
      try {
        sock.off('matchQueued');
        sock.off('updateUsers');
        sock.off('matchRequestSent');
        sock.off('matchInvite');
        sock.off('matchInviteResult');
        sock.off('matchInviteDeclined');
        sock.off('matchInviteCancelled');
        sock.off('matchFound');
        sock.off('chessMove');
        sock.off('matchCancelled');
        sock.off('matchOpponentLeft');
      } catch (_) {}
      socketRef.current = null;
      if (inviteResultTimerRef.current) clearTimeout(inviteResultTimerRef.current);
    };
  }, [socketReady, baseMs, incMs]);

  // Auto-accept an invite if this page was opened from the global overlay
  useEffect(() => {
    const qs = new URLSearchParams(routerLocation.search || '');
    const inviteId = (qs.get('accept_invite') || '').trim();
    const fromUsername = (qs.get('accept_from') || '').trim();
    if (!inviteId && !fromUsername) return;

    const sock = socketRef.current;
    const name = (username || '').trim();
    if (!sock || !name) return;

    try {
      sock.emit('join', { username: name, role: roleLabel || 'Player' });
      if (inviteId) sock.emit('matchInviteAccept', { inviteId });
      else sock.emit('matchInviteAccept', { fromUsername });
      setToast('Accepting…');
      // Clear params so refresh doesn't re-accept
      navigate('/player/live_match', { replace: true });
    } catch (_) {}
  }, [routerLocation.search, username, roleLabel, navigate]);

  // Close Play modal automatically if invite disappears
  useEffect(() => {
    if (!incomingInvite) setPlayOpen(false);
  }, [incomingInvite]);

  // Keep presence updated once we know the username
  useEffect(() => {
    const sock = socketRef.current;
    const name = (username || '').trim();
    if (!sock || !name) return;
    try {
      sock.emit('join', { username: name, role: roleLabel || 'Player' });
    } catch (_) {}
  }, [username, roleLabel, socketReady]);

  // Clock tick
  useEffect(() => {
    if (!running) return undefined;
    const timer = setInterval(() => {
      if (!lastTickAtRef.current) lastTickAtRef.current = Date.now();
      const now = Date.now();
      const dt = now - lastTickAtRef.current;
      if (dt <= 0) return;
      lastTickAtRef.current = now;

      if (activeTurn === 'w') setWhiteMs((prev) => Math.max(0, prev - dt));
      else setBlackMs((prev) => Math.max(0, prev - dt));
    }, 200);
    return () => clearInterval(timer);
  }, [running, activeTurn]);

  const requestMatch = () => {
    if (!socketRef.current) return;
    const baseMsLocal = clamp(minutes, 60, 120) * 60 * 1000;
    const incLocal = clamp(increment, 0, 90) * 1000;
    const name = (username || '').trim();
    if (!name) {
      alert('Username not found. Please login again.');
      return;
    }
    try {
      socketRef.current.emit('join', { username: name, role: roleLabel || 'Player' });
      socketRef.current.emit('matchRequest', { username: name, baseMs: baseMsLocal, incMs: incLocal, colorPref });
    } catch (_) {}
  };

  const requestSpecificPlayer = () => {
    if (!socketRef.current) return;
    const baseMsLocal = clamp(minutes, 60, 120) * 60 * 1000;
    const incLocal = clamp(increment, 0, 90) * 1000;
    const name = (username || '').trim();
    const target = (selectedPlayer || playerSearch || '').trim();
    if (!name) {
      alert('Username not found. Please login again.');
      return;
    }
    if (!target) {
      alert('Search and select a player to request.');
      return;
    }
    setInviteResult('');
    try {
      socketRef.current.emit('join', { username: name, role: roleLabel || 'Player' });
      socketRef.current.emit('matchDirectRequest', { username: name, targetUsername: target, baseMs: baseMsLocal, incMs: incLocal, colorPref });
    } catch (_) {}
  };

  const cancelRequest = () => {
    if (!socketRef.current) return;
    try { socketRef.current.emit('matchCancel'); } catch (_) {}
  };

  const acceptInvite = () => {
    if (!socketRef.current || !incomingInvite) return;
    const name = (username || '').trim();
    if (!name) return;
    try {
      socketRef.current.emit('join', { username: name, role: roleLabel || 'Player' });
      if (incomingInvite.inviteId) socketRef.current.emit('matchInviteAccept', { inviteId: incomingInvite.inviteId });
      else socketRef.current.emit('matchInviteAccept', { fromUsername: incomingInvite.from });
    } catch (_) {}
    setIncomingInvite(null);
    setPlayOpen(false);
  };

  const declineInvite = () => {
    if (!socketRef.current || !incomingInvite) return;
    try {
      if (incomingInvite.inviteId) socketRef.current.emit('matchInviteDecline', { inviteId: incomingInvite.inviteId });
      else socketRef.current.emit('matchInviteDecline', { fromUsername: incomingInvite.from });
    } catch (_) {}
    setIncomingInvite(null);
    setPlayOpen(false);
  };

  const tryMove = (from, to) => {
    if (!socketRef.current || !room) return;
    if (!chessReady || !ChessCtorRef.current) return;
    if (!myTurn) return;

    const now = Date.now();
    if (!lastTickAtRef.current) lastTickAtRef.current = now;
    const dt = now - lastTickAtRef.current;

    let nextWhite = whiteMs;
    let nextBlack = blackMs;
    if (activeTurn === 'w') nextWhite = Math.max(0, nextWhite - dt);
    else nextBlack = Math.max(0, nextBlack - dt);

    try {
      const game = new ChessCtorRef.current(fen === 'start' ? undefined : fen);
      const result = game.move({ from, to, promotion: 'q' });
      if (!result) return;

      if (activeTurn === 'w') nextWhite += incMs;
      else nextBlack += incMs;

      const newFen = game.fen();
      setFen(newFen);
      setWhiteMs(nextWhite);
      setBlackMs(nextBlack);
      lastTickAtRef.current = Date.now();

      socketRef.current.emit('chessMove', {
        room,
        move: {
          from,
          to,
          fen: newFen,
          by: username,
          whiteMs: nextWhite,
          blackMs: nextBlack
        }
      });
    } catch {
      // ignore
    }
  };

  const onCellClick = (sq) => {
    if (status !== 'playing') return;
    if (!myTurn) return;

    if (!selectedSq) {
      setSelectedSq(sq);
      return;
    }

    if (selectedSq === sq) {
      setSelectedSq(null);
      return;
    }

    const from = selectedSq;
    const to = sq;
    setSelectedSq(null);
    tryMove(from, to);
  };

  const displayBoard = useMemo(() => {
    if (myColor !== 'black') return board;
    return board.slice().reverse().map((row) => row.slice().reverse());
  }, [board, myColor]);

  const squareForDisplay = (rowIndex, colIndex) => {
    if (myColor !== 'black') return squareName(colIndex, rowIndex);
    const originalRow = 7 - rowIndex;
    const originalCol = 7 - colIndex;
    return squareName(originalCol, originalRow);
  };

  return (
    <div className="page player-neo" style={{ minHeight: '100vh' }}>
      <div style={{ width: '100%', padding: '1.5rem', color: 'var(--text-color)' }}>
        {!!toast && (
          <div style={{ position: 'fixed', top: 18, right: 18, zIndex: 2000, background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '10px 12px', borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}>
            <div style={{ fontWeight: 700, color: 'var(--sea-green)' }}>{toast}</div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
          <h1 style={{ margin: 0, fontFamily: 'Cinzel, serif', color: 'var(--sea-green)' }}>
            Live Match
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => {
                if (!incomingInvite) {
                  setToast('No match requests');
                  return;
                }
                setPlayOpen(true);
              }}
              style={{
                background: incomingInvite ? 'var(--sea-green)' : 'transparent',
                border: incomingInvite ? 'none' : '2px solid var(--sea-green)',
                color: incomingInvite ? 'var(--on-accent)' : 'var(--sea-green)',
                padding: '8px 12px',
                borderRadius: 8,
                cursor: 'pointer',
                fontFamily: 'Cinzel, serif',
                fontWeight: 'bold'
              }}
              aria-label="Play (incoming request)"
            >
              Play{incomingInvite ? ' (1)' : ''}
            </button>
            <button
              onClick={toggleTheme}
              style={{ background: 'transparent', border: '2px solid var(--sea-green)', color: 'var(--sea-green)', padding: '8px 12px', borderRadius: 8, cursor: 'pointer', fontFamily: 'Cinzel, serif', fontWeight: 'bold' }}
            >
              {isDark ? 'Switch to Light' : 'Switch to Dark'}
            </button>
            <button
              onClick={() => navigate('/player/player_dashboard')}
              style={{ background: 'transparent', border: '2px solid var(--sky-blue)', color: 'var(--sky-blue)', padding: '8px 12px', borderRadius: 8, cursor: 'pointer', fontFamily: 'Cinzel, serif', fontWeight: 'bold' }}
            >
              Back
            </button>
          </div>
        </div>

        {playOpen && incomingInvite && (
          <div
            role="dialog"
            aria-modal="true"
            onClick={() => setPlayOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.55)',
              zIndex: 2500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem'
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: 'min(520px, 100%)',
                background: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
                borderRadius: 14,
                padding: '1rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center' }}>
                <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 800, color: 'var(--sky-blue)' }}>Play Request</div>
                <button
                  onClick={() => setPlayOpen(false)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-color)', cursor: 'pointer', fontSize: 18, opacity: 0.85 }}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <div style={{ marginTop: 10, opacity: 0.92 }}>
                <div>
                  From: <strong>{incomingInvite.from}</strong>
                </div>
                <div style={{ marginTop: 6 }}>
                  Time control: <strong>{Math.round((incomingInvite.baseMs || baseMs) / 60000)}+{Math.round((incomingInvite.incMs || incMs) / 1000)}</strong>
                </div>
                <div style={{ marginTop: 6 }}>
                  Requested color: <strong>{incomingInvite.colorPref || 'random'}</strong>
                </div>
              </div>

              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={acceptInvite}
                  style={{ background: 'var(--sea-green)', color: 'var(--on-accent)', border: 'none', padding: '10px 14px', borderRadius: 10, cursor: 'pointer', fontFamily: 'Cinzel, serif', fontWeight: 'bold', flex: 1 }}
                >
                  Accept
                </button>
                <button
                  onClick={declineInvite}
                  style={{ background: 'transparent', color: 'var(--sea-green)', border: '2px solid var(--sea-green)', padding: '10px 14px', borderRadius: 10, cursor: 'pointer', fontFamily: 'Cinzel, serif', fontWeight: 'bold', flex: 1 }}
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}

        {status !== 'playing' && (
          <div style={{ maxWidth: 720, background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 14, padding: '1rem' }}>

            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Search player</label>
              <input
                type="text"
                value={playerSearch}
                onChange={(e) => {
                  const v = e.target.value;
                  setPlayerSearch(v);
                  setSelectedPlayer('');
                  setShowSearchDropdown(true);
                }}
                onFocus={() => setShowSearchDropdown(true)}
                placeholder="Type username to search"
                disabled={status === 'queued'}
                style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '2px solid var(--sky-blue)', background: 'var(--content-bg)', color: 'var(--text-color)' }}
              />

              {showSearchDropdown && (playerSearch || '').trim() && status !== 'queued' && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, maxHeight: 220, overflow: 'auto', border: '1px solid var(--card-border)', borderTop: 'none', borderRadius: '0 0 10px 10px', background: 'var(--content-bg)' }}>
                  {(() => {
                    const q = (playerSearch || '').toLowerCase().trim();
                    const list = (onlineUsers || [])
                      .filter((u) => u && u.username)
                      .filter((u) => (u.role || '').toString().toLowerCase() === 'player')
                      .filter((u) => u.username !== username)
                      .filter((u) => u.username.toLowerCase().includes(q));

                    if (list.length === 0) {
                      return <div style={{ padding: '0.75rem', opacity: 0.85 }}>No matching online players.</div>;
                    }

                    return list.slice(0, 25).map((u) => (
                      <button
                        key={u.username}
                        onClick={() => {
                          setSelectedPlayer(u.username);
                          setPlayerSearch(u.username);
                          setShowSearchDropdown(false);
                        }}
                        style={{ width: '100%', textAlign: 'left', padding: '0.7rem 0.8rem', border: 'none', background: 'transparent', color: 'var(--text-color)', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                      >
                        {u.username}
                      </button>
                    ));
                  })()}
                </div>
              )}
            </div>

            {selectedPlayer && (
              <div style={{ marginBottom: '1rem', opacity: 0.9 }}>
                Selected: <strong>{selectedPlayer}</strong>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Time (minutes)</label>
                <input
                  type="number"
                  min={60}
                  max={120}
                  value={minutes}
                  onChange={(e) => setMinutes(clamp(e.target.value, 60, 120))}
                  disabled={status === 'queued'}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--card-border)', background: 'var(--content-bg)', color: 'var(--text-color)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Increment (seconds)</label>
                <input
                  type="number"
                  min={0}
                  max={90}
                  value={increment}
                  onChange={(e) => setIncrement(clamp(e.target.value, 0, 90))}
                  disabled={status === 'queued'}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--card-border)', background: 'var(--content-bg)', color: 'var(--text-color)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Color</label>
                <select
                  value={colorPref}
                  onChange={(e) => setColorPref(e.target.value)}
                  disabled={status === 'queued'}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--card-border)', background: 'var(--content-bg)', color: 'var(--text-color)' }}
                >
                  <option value="random">Random</option>
                  <option value="white">White</option>
                  <option value="black">Black</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
              {status !== 'queued' ? (
                <button
                  onClick={requestMatch}
                  disabled={!socketReady || !chessReady}
                  style={{ background: 'var(--sea-green)', color: 'var(--on-accent)', border: 'none', padding: '10px 14px', borderRadius: 10, cursor: 'pointer', fontFamily: 'Cinzel, serif', fontWeight: 'bold' }}
                >
                  Request Match
                </button>
              ) : (
                <button
                  onClick={cancelRequest}
                  style={{ background: 'transparent', color: 'var(--sea-green)', border: '2px solid var(--sea-green)', padding: '10px 14px', borderRadius: 10, cursor: 'pointer', fontFamily: 'Cinzel, serif', fontWeight: 'bold' }}
                >
                  Cancel
                </button>
              )}

              <div style={{ alignSelf: 'center', opacity: 0.85 }}>
                {!socketReady ? 'Loading live server…' : (!chessReady ? 'Loading chess engine…' : (status === 'queued' ? 'Searching opponent…' : ''))}
              </div>
            </div>

            {inviteResult && (
              <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.75rem', borderRadius: 10, border: '1px solid var(--card-border)', background: 'var(--content-bg)' }}>
                {inviteResult}
              </div>
            )}

            {incomingInvite && (
              <div style={{ marginTop: '0.75rem', padding: '0.75rem', borderRadius: 12, border: '1px solid var(--card-border)', background: 'var(--content-bg)' }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Incoming request waiting</div>
                <div style={{ opacity: 0.85 }}>
                  Click <strong>Play</strong> to view & respond.
                </div>
              </div>
            )}

            {status !== 'queued' && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--card-border)' }}>
                <button
                  onClick={requestSpecificPlayer}
                  disabled={!socketReady || !chessReady || !(selectedPlayer || (playerSearch || '').trim())}
                  style={{ background: 'transparent', border: '2px solid var(--sky-blue)', color: 'var(--sky-blue)', padding: '10px 14px', borderRadius: 10, cursor: 'pointer', fontFamily: 'Cinzel, serif', fontWeight: 'bold', width: '100%' }}
                >
                  Send Match Request
                </button>
              </div>
            )}

            <div style={{ marginTop: '0.75rem', opacity: 0.85 }}>
              Logged in as: <strong>{username || '...'}</strong>
            </div>
          </div>
        )}

        {status === 'playing' && (
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 14, padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--sky-blue)' }}>{opponent ? `Opponent: ${opponent}` : 'Opponent'}</div>
                  <div style={{ opacity: 0.85 }}>You: {username || 'Player'} ({myColor})</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'Cinzel, serif', color: 'var(--sea-green)' }}>{formatClock(myColor === 'white' ? whiteMs : blackMs)}</div>
                  <div style={{ opacity: 0.85 }}>Your time</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 52px)', gridTemplateRows: 'repeat(8, 52px)', border: '2px solid var(--card-border)' }}>
                {displayBoard.map((row, r) =>
                  row.map((piece, c) => {
                    const sq = squareForDisplay(r, c);
                    const isSelected = selectedSq === sq;
                    const light = (r + c) % 2 === 0;
                    return (
                      <button
                        key={`${r}-${c}`}
                        onClick={() => onCellClick(sq)}
                        style={{
                          width: 52,
                          height: 52,
                          padding: 0,
                          border: 'none',
                          cursor: myTurn ? 'pointer' : 'not-allowed',
                          background: isSelected ? 'rgba(135,206,235,0.35)' : (light ? '#f0d9b5' : '#b58863'),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 30,
                          lineHeight: 1
                        }}
                        disabled={!myTurn}
                        aria-label={sq}
                      >
                        {pieceToUnicode(piece)}
                      </button>
                    );
                  })
                )}
              </div>

              <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                <div style={{ opacity: 0.85 }}>Turn: <strong>{activeTurn === 'w' ? 'White' : 'Black'}</strong></div>
                <div style={{ opacity: 0.85 }}>Room: <strong>{room}</strong></div>
              </div>
            </div>

            <div style={{ minWidth: 280, background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 14, padding: '1rem' }}>
              <div style={{ fontWeight: 700, marginBottom: 8, color: 'var(--sea-green)' }}>Clocks</div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>White</div>
                <div style={{ fontFamily: 'Cinzel, serif' }}>{formatClock(whiteMs)}</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>Black</div>
                <div style={{ fontFamily: 'Cinzel, serif' }}>{formatClock(blackMs)}</div>
              </div>

              <div style={{ marginTop: '1rem', opacity: 0.85 }}>
                Time control: <strong>{clamp(minutes, 60, 120)}+{clamp(increment, 0, 90)}</strong>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <button
                  onClick={() => {
                    if (!socketRef.current) return;
                    try { socketRef.current.emit('matchLeave'); } catch (_) {}
                    setStatus('idle');
                    setRoom('');
                    setOpponent('');
                    setFen('start');
                    setSelectedSq(null);
                  }}
                  style={{ background: 'transparent', border: '2px solid var(--sea-green)', color: 'var(--sea-green)', padding: '10px 14px', borderRadius: 10, cursor: 'pointer', fontFamily: 'Cinzel, serif', fontWeight: 'bold', width: '100%' }}
                >
                  Leave Match
                </button>
              </div>

              <div style={{ marginTop: '0.75rem' }}>
                <Link to="/player/player_dashboard" style={{ textDecoration: 'none', color: 'var(--sky-blue)' }}>
                  Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
