import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { createSocket } from '../../utils/socket';
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

const SOCKET_IO_PATH = '/socket.io/socket.io.js';

function CoordinatorChat() {
  const [isDark, toggleTheme] = usePlayerTheme();
  const [role, setRole] = useState('Coordinator');
  const [username, setUsername] = useState('');
  const [joined, setJoined] = useState(false);
  const [prefilledFromSession, setPrefilledFromSession] = useState(false);

  const [receiver, setReceiver] = useState('All');
  const activeReceiverRef = useRef('All');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]); // {sender, text, type}
  const [contacts, setContacts] = useState([]);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [usernameSearch, setUsernameSearch] = useState('');
  // manualTarget removed; use usernameSearch + results

  const socketRef = useRef(null);
  const chatBoxRef = useRef(null);

  // Load Socket.IO client script dynamically
  useEffect(() => {
    if (window.io) return; // already loaded
    const script = document.createElement('script');
    script.src = SOCKET_IO_PATH;
    script.async = true;
    document.body.appendChild(script);
    return () => {
      try { document.body.removeChild(script); } catch (_) {}
    };
  }, []);

  // Load session info to prefill username if logged in
  useEffect(() => {
    fetch('/api/session').then(r => r.json()).then(d => {
      if (d && d.username) {
        setUsername(d.username);
        setPrefilledFromSession(true);
      }
      if (d && d.userRole) setRole(d.userRole.charAt(0).toUpperCase() + d.userRole.slice(1));
    }).catch(() => {});
  }, []);

  // Restore receiver from localStorage so active chat survives reload
  useEffect(() => {
    try {
      const saved = localStorage.getItem('chat_receiver');
      if (saved) setReceiver(saved);
    } catch (_) {}
  }, []);

  // Establish socket connection and listeners
  useEffect(() => {
    if (!window.io) {
      const t = setTimeout(() => {}, 200);
      return () => clearTimeout(t);
    }
    if (socketRef.current) return; // already connected
    const sock = createSocket();
    if (!sock) return;
    socketRef.current = sock;

    sock.on('message', (payload) => {
      try {
        const { sender, message: text, receiver: to } = payload || {};
        const active = activeReceiverRef.current;
        let belongs = false;
        if (active === 'All') {
          belongs = to === 'All';
        } else {
          belongs = (sender === active && to === username) || (sender === username && to === active);
        }
        if (belongs) {
          setMessages((prev) => {
            const next = { sender, text, type: sender === username ? 'sent' : 'received', receiver: to };
            const last = prev[prev.length - 1];
            if (last && last.text === next.text && last.sender === next.sender && last.receiver === next.receiver) return prev;
            return [...prev, next];
          });
          if (chatBoxRef.current) chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
      } catch (_) {}
    });

    return () => {
      try {
        sock.off('message');
        sock.disconnect();
      } catch (_) {}
      socketRef.current = null;
    };
  }, [username]);

  useEffect(() => {
    activeReceiverRef.current = receiver;
  }, [receiver]);

  // Load chat history for selected room (global or private)
  useEffect(() => {
    async function loadHistory() {
      if (!joined) return;
      const room = receiver === 'All' ? 'global' : `pm:${[username, receiver].sort().join(':')}`;
      try {
        const res = await fetch(`/api/chat/history?room=${encodeURIComponent(room)}`, { credentials: 'include' });
        if (!res.ok) return;
        const data = await res.json();
        if (data && Array.isArray(data.history)) {
          const hist = data.history.slice().reverse().map(h => ({ sender: h.sender, text: h.message, type: h.sender === username ? 'sent' : 'received', receiver: h.receiver || (h.room==='global' ? 'All' : receiver) }));
          setMessages(hist);
          if (chatBoxRef.current) chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
      } catch (e) {
        // ignore
      }
    }
    loadHistory();
  }, [receiver, joined, username]);

  const loadContacts = useCallback(async () => {
    if (!username) return;
    try {
      const res = await fetch(`/api/chat/contacts?username=${encodeURIComponent(username)}`, { credentials: 'include' });
      if (!res.ok) return;
      const data = await res.json();
      if (data && Array.isArray(data.contacts)) setContacts(data.contacts);
    } catch (e) {}
  }, [username]);

  useEffect(() => { loadContacts(); }, [loadContacts]);

  // Search registered users by role
  const searchRegisteredUsers = async () => {
    try {
      const roleParam = role ? role.toLowerCase() : '';
      const res = await fetch(`/api/users?role=${encodeURIComponent(roleParam)}`, { credentials: 'include' });
      if (!res.ok) return;
      const data = await res.json();
      if (data && Array.isArray(data.users)) {
        let list = data.users;
        if (usernameSearch && usernameSearch.trim()) {
          const q = usernameSearch.trim().toLowerCase();
          list = list.filter(u => (u.username || '').toLowerCase().includes(q));
        }
        list = list.filter(u => ['coordinator','player'].includes((u.role || '').toLowerCase()));
        setRegisteredUsers(list);
      }
    } catch (e) {}
  };

  const joinChat = useCallback(() => {
    if (!username.trim()) {
      alert('Enter your name');
      return;
    }
    if (!socketRef.current) return;
    socketRef.current.emit('join', { username: username.trim(), role });
    setJoined(true);
    setTimeout(loadContacts, 250);
  }, [username, role, loadContacts]);

  const openChatWith = (target) => {
    const t = (target || '').trim();
    if (!t) return;
    if (t === username) {
      alert('You cannot chat with yourself');
      return;
    }
    if (!joined) joinChat();
    setReceiver(t);
  };

  // Persist selected receiver to localStorage so reload keeps the chat open
  useEffect(() => {
    try {
      if (receiver) localStorage.setItem('chat_receiver', receiver);
    } catch (_) {}
  }, [receiver]);

  // Auto-join when session prefilled and socket available
  useEffect(() => {
    if (prefilledFromSession && username && !joined) {
      const t = setTimeout(() => { if (!joined) joinChat(); }, 250);
      return () => clearTimeout(t);
    }
  }, [prefilledFromSession, username, joined, joinChat]);

  const sendMessage = () => {
    const text = message.trim();
    if (!text) return;
    if (!socketRef.current) return;
    socketRef.current.emit('chatMessage', { sender: username.trim(), receiver, message: text });
    setMessage('');
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
    setTimeout(loadContacts, 250);
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
        .chat-container { display:flex; max-width:1100px; margin:0 auto; gap:1rem; }
        .chat-sidebar { flex:0 0 320px; background:var(--card-bg); border-radius:12px; padding:1rem; border:1px solid var(--card-border); }
        .chat-main { flex:1; background:var(--card-bg); border-radius:12px; padding:1rem; border:1px solid var(--card-border); }
        .form-input { width:100%; padding:0.8rem; margin-bottom:1rem; border:2px solid var(--sea-green); border-radius:8px; font-family:'Playfair Display', serif; background:var(--card-bg); color:var(--text-color); }
        .form-select { width:100%; padding:0.8rem; margin-bottom:1rem; border:2px solid var(--sea-green); border-radius:8px; font-family:'Playfair Display', serif; background:var(--card-bg); color:var(--text-color); }
        .btn-primary { background:var(--sea-green); color:var(--on-accent); border:none; padding:0.8rem 1.5rem; border-radius:8px; cursor:pointer; font-family:'Cinzel', serif; font-weight:bold; display:inline-flex; align-items:center; gap:0.5rem; }
        .action-btn { background:var(--sky-blue); color:var(--sea-green); border:none; padding:0.8rem 1.5rem; border-radius:8px; cursor:pointer; font-family:'Cinzel', serif; font-weight:bold; display:inline-flex; align-items:center; gap:0.5rem; text-decoration:none; }
        .chat-box { height:480px; border:2px solid var(--sea-green); border-radius:8px; padding:1rem; margin:1rem 0; overflow-y:auto; background:var(--page-bg); }
        .chat-msg { margin-bottom:1rem; padding:0.8rem; border-radius:8px; max-width:80%; }
        .chat-sent { background:var(--sea-green); color:var(--on-accent); margin-left:auto; }
        .chat-received { background:var(--sky-blue); color:var(--sea-green); }
        .contact-item { display:flex; justify-content:space-between; align-items:center; padding:0.6rem; border-bottom:1px solid var(--card-border); cursor:pointer; }
        .contact-item:hover { background:rgba(var(--sea-green-rgb, 27, 94, 63), 0.1); }
        .search-result { display:flex; justify-content:space-between; padding:0.4rem 0; border-bottom:1px dashed var(--card-border); }
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
          <i className="fas fa-comments" />
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
            <i className="fas fa-comments" /> Live Chat
          </motion.h1>

          <div className="chat-container">
            <motion.div
              className="chat-sidebar"
              custom={0}
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
            >
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <select className="form-select" style={{ flex: 1 }} value={role} onChange={(e) => setRole(e.target.value)}>
                  <option>Coordinator</option>
                  <option>Player</option>
                </select>
                <input placeholder="username (optional)" value={usernameSearch} onChange={(e) => setUsernameSearch(e.target.value)} style={{ width: 160, padding: '0.6rem', borderRadius: 8, border: '2px solid var(--sea-green)', background: 'var(--card-bg)', color: 'var(--text-color)' }} />
                <button className="btn-primary" style={{ padding: '0.5rem 0.8rem' }} onClick={searchRegisteredUsers}>Search</button>
                <button className="btn-primary" style={{ padding: '0.5rem 0.8rem' }} onClick={() => openChatWith(usernameSearch)}>Start Chat</button>
              </div>

              <div style={{ marginBottom: '0.5rem' }}>
                <input className="form-input" style={{ padding: '0.6rem' }} value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Your name..." disabled={joined || prefilledFromSession} />
                <button className="btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} onClick={joinChat} disabled={joined}>{joined ? 'Joined' : 'Join'}</button>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <h4 style={{ margin: 0, marginBottom: '0.5rem', color: 'var(--sea-green)' }}>Contacts</h4>
                <div style={{ maxHeight: 420, overflowY: 'auto', marginTop: '0.5rem' }}>
                  {contacts.length === 0 && <div style={{ color: 'var(--text-color)', opacity: 0.7 }}>No contacts yet. Search users or send a message.</div>}
                  {contacts.map(c => (
                    <div key={c.contact} onClick={() => { if (!joined) joinChat(); setReceiver(c.contact); }} className="contact-item">
                      <div>
                        <div style={{ fontWeight: 'bold', color: 'var(--sea-green)' }}>{c.contact}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-color)', opacity: 0.7 }}>{c.lastMessage}</div>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-color)', opacity: 0.5 }}>{c.timestamp ? new Date(c.timestamp).toLocaleTimeString() : ''}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: '0.75rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--sea-green)' }}>Search results</h4>
                <div style={{ maxHeight: 180, overflowY: 'auto', borderTop: '1px solid var(--card-border)', paddingTop: '0.5rem' }}>
                  {registeredUsers.length === 0 && <div style={{ color: 'var(--text-color)', opacity: 0.7 }}>No users found for selected role/username.</div>}
                  {registeredUsers.map(u => (
                    <div key={u.username} className="search-result">
                      <div style={{ color: 'var(--sea-green)' }}>{u.username} <small style={{ color: 'var(--text-color)', opacity: 0.7 }}>({u.role})</small></div>
                      <div>
                        <button type="button" className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: 12 }} onClick={() => openChatWith(u.username)}>Chat</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              className="chat-main"
              custom={1}
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h2 style={{ margin: 0, fontFamily: 'Cinzel, serif', color: 'var(--sea-green)' }}>{receiver === 'All' ? 'Global Chat' : receiver}</h2>
                <div style={{ color: 'var(--text-color)', opacity: 0.7, fontSize: 14 }}>{joined ? 'Connected' : 'Not joined'}</div>
              </div>

              <div id="chatBox" className="chat-box" ref={chatBoxRef}>
                {messages.map((m, idx) => (
                  <div key={idx} className={`chat-msg ${m.type === 'sent' ? 'chat-sent' : 'chat-received'}`}>
                    <p style={{ margin: 0 }}><strong>{m.type === 'sent' ? 'You' : m.sender}:</strong> {m.text}</p>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                <input id="chatMessage" className="form-input" style={{ marginBottom: 0 }} type="text" placeholder="Type a message" value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }} />
                <button type="button" className="btn-primary" onClick={sendMessage}><i className="fas fa-paper-plane" /> <span>Send</span></button>
              </div>
            </motion.div>
          </div>

          <div style={{ textAlign: 'right', marginTop: '2rem' }}>
            <Link to="/coordinator/coordinator_dashboard" className="action-btn">
              <i className="fas fa-arrow-left" /> Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CoordinatorChat;
