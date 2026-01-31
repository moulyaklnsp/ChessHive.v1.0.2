const express = require('express');
const path = require('path');
const session = require('express-session');
const methodOverride = require('method-override');
const http = require('http');
const { Server } = require('socket.io');
// nodemailer is optional. If not installed or SMTP not configured, magic link will be logged to console.
let nodemailer;
try { nodemailer = require('nodemailer'); } catch (e) { nodemailer = null; }
require('dotenv').config();
const { connectDB } = require('./routes/databasecongi');

const adminRouter = require('./admin_app');
const organizerRouter = require('./organizer_app');
const coordinatorRouter = require('./coordinator_app');
const playerRouter = require('./player_app');

const utils = require('./utils');
const { ObjectId } = require('mongodb');


const app = express();
const cors = require('cors');
// Allow CORS from common React dev ports (proxy or direct)
app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:3001'], credentials: true }));
// Increase maxHeaderSize to accept larger request headers (fixes 431 errors)
// Default Node limit can be too small when many/large cookies or headers are present.
// Raise to 1MB to tolerate larger Cookie headers from development environments.
const server = http.createServer({ maxHeaderSize: 1048576 }, app);
const io = new Server(server, { cors: { origin: ['http://localhost:3000', 'http://localhost:3001'], methods: ['GET', 'POST'], credentials: true } });
const PORT = process.env.PORT || 3001;

app.use(session({
  name: process.env.SESSION_COOKIE_NAME || 'sid',
  secret: process.env.SESSION_SECRET || 'your_secret_key',
  resave: false,
  saveUninitialized: false,
  rolling: false,
  cookie: { secure: false, sameSite: 'lax', maxAge: 24 * 60 * 60 * 1000 }
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// mount optional auth router
try { console.log('Mounting auth router')
  const authrouter = require('./routes/auth'); app.use(authrouter); } catch (e) { /* optional */ }

// Role middleware
const isAdmin = (req, res, next) => { if (req.session.userRole === 'admin') next(); else res.status(403).send('Unauthorized'); };
const isOrganizer = (req, res, next) => { if (req.session.userRole === 'organizer') next(); else res.status(403).send('Unauthorized'); };
const isCoordinator = (req, res, next) => {
  if (req.session.userRole === 'coordinator') return next();
  // Dev convenience: allow header override to unblock local React without breaking production
  const isDev = (process.env.NODE_ENV || 'development') !== 'production';
  const headerRole = (req.get('x-dev-role') || '').toLowerCase();
  const headerEmail = req.get('x-dev-email');
  if (isDev && headerRole === 'coordinator' && headerEmail) {
    req.session.userRole = 'coordinator';
    req.session.userEmail = headerEmail;
    // username is optional but helps downstream queries
    req.session.username = req.session.username || headerEmail;
    return next();
  }
  return res.status(403).send('Unauthorized');
};
const isPlayer = (req, res, next) => {
  // Dev mode: allow override with headers (helps local React dev)
  const isDev = (process.env.NODE_ENV || 'development') !== 'production';
  const headerRole = (req.get('x-dev-role') || '').toLowerCase();
  const headerEmail = req.get('x-dev-email');
  const headerUsername = req.get('x-dev-username');
  if (isDev && headerRole === 'player' && headerEmail) {
    req.session.userRole = 'player';
    req.session.userEmail = headerEmail;
    req.session.username = headerUsername || headerEmail.split('@')[0];
    console.log('DEV: isPlayer bypass enabled for', req.session.userEmail);
  }
  if (req.session.userRole === 'player') next(); else res.status(403).send('Unauthorized');
};
const isAdminOrOrganizer = (req, res, next) => { if (req.session.userRole === 'admin' || req.session.userRole === 'organizer') next(); else res.status(403).json({ success: false, message: 'Unauthorized' }); };

// Mount routers
app.use('/admin', isAdmin, adminRouter);
app.use('/organizer', isOrganizer, organizerRouter);
app.use('/coordinator', isCoordinator, coordinatorRouter);
app.use('/player', isPlayer, playerRouter.router);

// Serve index
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'views', 'index.html')));
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Login with OTP
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body || {};
  try {
    const db = await connectDB();
    const user = await db.collection('users').findOne({ email, password });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid credentials' });
    if (user.isDeleted) {
      return res.status(403).json({
        success: false,
        message: 'Account has been deleted',
        restoreRequired: true,
        deletedUserId: user._id.toString(),
        deletedUserRole: user.role || null
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store OTP in database
    await db.collection('otps').insertOne({
      email,
      otp,
      type: 'login',
      expires_at: expiresAt,
      used: false
    });

    // Send OTP via email
    async function sendOtpEmail(to, otp) {
      if (!nodemailer) {
        console.log(`nodemailer not installed. OTP for ${to}: ${otp}`);
        return { previewUrl: null, messageId: null, info: null };
      }

      // If no SMTP configured, use Ethereal test account for local testing
      if (!process.env.SMTP_HOST) {
        try {
          const testAccount = await nodemailer.createTestAccount();
          const transporter = nodemailer.createTransport({ host: testAccount.smtp.host, port: testAccount.smtp.port, secure: testAccount.smtp.secure, auth: { user: testAccount.user, pass: testAccount.pass } });
          const info = await transporter.sendMail({ from: process.env.SMTP_FROM || '', to, subject: 'Your ChessHive OTP', text: `Your OTP is: ${otp}. It expires in 5 minutes.` });
          const previewUrl = nodemailer.getTestMessageUrl(info);
          console.log(`Ethereal OTP preview for ${to}: ${previewUrl}`);
          return { previewUrl, messageId: info && info.messageId, info };
        } catch (err) {
          console.error('Failed to send via Ethereal, falling back to console:', err);
          console.log(`OTP for ${to}: ${otp}`);
          return { previewUrl: null, messageId: null, info: null };
        }
      }

      // SMTP configured path
      try {
        const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: parseInt(process.env.SMTP_PORT || '587', 10), secure: (process.env.SMTP_SECURE === 'true'), auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined });
        // attempt to verify transporter (helps surfacing auth/connectivity issues early)
        try {
          await transporter.verify();
          console.log('SMTP transporter verified');
        } catch (verErr) {
          console.warn('SMTP transporter verification failed:', verErr);
        }
        const info = await transporter.sendMail({ from: process.env.SMTP_FROM || '', to, subject: 'Your ChessHive OTP', text: `Your OTP is: ${otp}. It expires in 5 minutes.` });
        console.log('OTP email sent:', info && info.messageId, 'envelope:', info && info.envelope);
        return { previewUrl: null, messageId: info && info.messageId, info };
      } catch (err) {
        console.error('Failed to send OTP email, falling back to console:', err);
        console.log(`OTP for ${to}: ${otp}`);
        return { previewUrl: null, messageId: null, info: null };
      }
    }

    // Send OTP
    let preview = null;
    let messageId = null;
    try {
      const result = await sendOtpEmail(user.email, otp);
      if (result) {
        if (result.previewUrl) preview = result.previewUrl;
        if (result.messageId) messageId = result.messageId;
      }
    } catch (e) {
      console.error('sendOtpEmail error:', e);
    }

    // Tell frontend that OTP was sent
    const responsePayload = { success: true, message: 'OTP sent to registered email' };
    if (preview) responsePayload.previewUrl = preview;
    if (messageId) responsePayload.messageId = messageId;
    return res.json(responsePayload);
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'An unexpected error occurred' });
  }
});

// Restore deleted account
app.post('/api/restore-account', async (req, res) => {
  try {
    const { id, email, password } = req.body || {};
    if (!id || !email || !password) {
      return res.status(400).json({ success: false, message: 'id, email and password are required' });
    }
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid user id' });
    }
    const db = await connectDB();
    const user = await db.collection('users').findOne({ _id: new ObjectId(id), email, password });
    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found or invalid credentials' });
    }
    if (!user.isDeleted) {
      return res.status(400).json({ success: false, message: 'Account is already active' });
    }
    const upd = await db.collection('users').updateOne(
      { _id: new ObjectId(id) },
      { $set: { isDeleted: 0, restored_date: new Date(), restored_by: email }, $unset: { deleted_date: '', deleted_by: '' } }
    );
    if (upd.modifiedCount === 0) {
      return res.status(500).json({ success: false, message: 'Failed to restore account' });
    }
    return res.json({ success: true, message: 'Account restored successfully. Please login again to continue.' });
  } catch (err) {
    console.error('Restore account error:', err);
    return res.status(500).json({ success: false, message: 'Unexpected server error' });
  }
});

// Verify login OTP
app.post('/api/verify-login-otp', async (req, res) => {
  const { email, otp } = req.body || {};
  try {
    if (!email || !otp) return res.status(400).json({ success: false, message: 'Email and OTP required' });

    const db = await connectDB();
    const otpRecord = await db.collection('otps').findOne({ email, otp, type: 'login', used: false });
    if (!otpRecord) return res.status(400).json({ success: false, message: 'Invalid OTP' });
    if (new Date() > otpRecord.expires_at) return res.status(400).json({ success: false, message: 'OTP expired' });

    // Mark OTP as used
    await db.collection('otps').updateOne({ _id: otpRecord._id }, { $set: { used: true } });

    // Fetch user and establish session
    const user = await db.collection('users').findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: 'User not found' });

    req.session.userID = user._id;
    req.session.userEmail = user.email;
    req.session.userRole = user.role;
    req.session.username = user.name;
    req.session.playerName = user.name;
    req.session.userCollege = user.college;
    req.session.collegeName = user.college;

    let redirectUrl = '';
    switch (user.role) {
      case 'admin': redirectUrl = '/admin/admin_dashboard'; break;
      case 'organizer': redirectUrl = '/organizer/organizer_dashboard'; break;
      case 'coordinator': redirectUrl = '/coordinator/coordinator_dashboard'; break;
      case 'player': redirectUrl = '/player/player_dashboard?success-message=Player Login Successful'; break;
      default: return res.status(400).json({ success: false, message: 'Invalid Role' });
    }
    res.json({ success: true, redirectUrl });
  } catch (err) {
    console.error('OTP verify error:', err);
    res.status(500).json({ success: false, message: 'Unexpected server error' });
  }
});



// Session info
app.get('/api/session', (req, res) => {
  res.json({ userEmail: req.session.userEmail || null, userRole: req.session.userRole || null, username: req.session.username || null });
});

// Player notifications (root-level aliases for React client)
app.get('/api/notifications', async (req, res) => {
  try {
    console.log('GET /api/notifications - Session:', { email: req.session.userEmail, role: req.session.userRole });
    if (!req.session.userEmail || req.session.userRole !== 'player') {
      return res.status(401).json({ error: 'Please log in' });
    }
    const db = await connectDB();
    const user = await db.collection('users').findOne({ email: req.session.userEmail, role: 'player' });
    if (!user) {
      console.log('GET /api/notifications - User not found for email:', req.session.userEmail);
      return res.status(404).json({ error: 'Player not found' });
    }
    console.log('GET /api/notifications - Found user:', { _id: user._id, name: user.name, email: user.email });

    const notifications = await db.collection('notifications').aggregate([
      { $match: { user_id: user._id } },
      { $lookup: { from: 'tournaments', localField: 'tournament_id', foreignField: '_id', as: 'tournament' } },
      { $unwind: '$tournament' },
      { $project: { _id: 1, type: 1, read: 1, date: 1, tournamentName: '$tournament.name', tournament_id: '$tournament._id' } }
    ]).toArray();

    console.log('GET /api/notifications - Found notifications:', notifications.length, notifications.map(n => ({ type: n.type, read: n.read, tournament: n.tournamentName })));

    const formatted = notifications.map(n => ({
      ...n,
      _id: n._id.toString(),
      tournament_id: n.tournament_id.toString()
    }));
    return res.json({ notifications: formatted });
  } catch (err) {
    console.error('GET /api/notifications error:', err);
    return res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

app.post('/api/notifications/mark-read', async (req, res) => {
  try {
    if (!req.session.userEmail || req.session.userRole !== 'player') {
      return res.status(401).json({ error: 'Please log in' });
    }
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: 'id required' });
    const db = await connectDB();
    await db.collection('notifications').updateOne({ _id: new ObjectId(id) }, { $set: { read: true } });
    return res.json({ success: true });
  } catch (err) {
    console.error('POST /api/notifications/mark-read error:', err);
    return res.status(500).json({ error: 'Failed to mark as read' });
  }
});

// Dev-only: inject a feedback_request notification for the logged-in player
app.post('/dev/mock-feedback', async (req, res) => {
  try {
    if ((process.env.NODE_ENV || 'development') === 'production') {
      return res.status(403).json({ error: 'Not available in production' });
    }
    if (!req.session.userEmail || req.session.userRole !== 'player') {
      return res.status(401).json({ error: 'Please log in as player' });
    }
    const { tournamentId } = req.body || {};
    if (!tournamentId || !ObjectId.isValid(tournamentId)) {
      return res.status(400).json({ error: 'Valid tournamentId required' });
    }
    const db = await connectDB();
    const user = await db.collection('users').findOne({ email: req.session.userEmail, role: 'player' });
    if (!user) return res.status(404).json({ error: 'Player not found' });
    const tid = new ObjectId(tournamentId);
    const tournament = await db.collection('tournaments').findOne({ _id: tid });
    if (!tournament) return res.status(404).json({ error: 'Tournament not found' });
    await db.collection('notifications').insertOne({
      user_id: user._id,
      type: 'feedback_request',
      tournament_id: tid,
      read: false,
      date: new Date()
    });
    return res.json({ success: true });
  } catch (e) {
    console.error('POST /dev/mock-feedback error:', e);
    return res.status(500).json({ error: 'Failed to create mock feedback notification' });
  }
});

// Theme preference (persist per user)
app.get('/api/theme', async (req, res) => {
  try {
    if (!req.session.userEmail) return res.json({ success: true, theme: null });
    const db = await connectDB();
    const user = await db.collection('users').findOne({ email: req.session.userEmail }, { projection: { theme: 1 } });
    const theme = (user && user.theme === 'dark') ? 'dark' : 'light';
    return res.json({ success: true, theme });
  } catch (e) {
    console.error('GET /api/theme error:', e);
    return res.status(500).json({ success: false, message: 'Failed to load theme' });
  }
});

app.post('/api/theme', async (req, res) => {
  try {
    const { theme } = req.body || {};
    if (!req.session.userEmail) return res.status(401).json({ success: false, message: 'Not logged in' });
    if (!['dark', 'light'].includes(theme)) return res.status(400).json({ success: false, message: 'Invalid theme value' });
    const db = await connectDB();
    await db.collection('users').updateOne({ email: req.session.userEmail }, { $set: { theme } });
    return res.json({ success: true });
  } catch (e) {
    console.error('POST /api/theme error:', e);
    return res.status(500).json({ success: false, message: 'Failed to save theme' });
  }
});



// Chat history
app.get('/api/chat/history', async (req, res) => {
  try {
    const room = (req.query.room || 'global').toString();
    const db = await connectDB();
    const history = await db.collection('chat_messages').find({ room }).sort({ timestamp: -1 }).limit(50).toArray();
    res.json({ success: true, history });
  } catch (err) {
    console.error('Chat history error:', err);
    res.status(500).json({ success: false, message: 'Unexpected server error' });
  }
});

// Search users by role (registered users) - returns basic public info (no password/mfaSecret)
app.get('/api/users', async (req, res) => {
  console.log('API /api/users called with query:', req.query);
  try {
    const role = (req.query.role || '').toString().toLowerCase();
    const q = {};
    if (role) q.role = role;
    const db = await connectDB();
    const users = await db.collection('users').find(q, { projection: { password: 0, mfaSecret: 0 } }).limit(200).toArray();
    // normalize name field to username for frontend compatibility
    const list = users.map(u => ({ id: u._id, username: u.name || u.username || u.email, email: u.email || null, role: u.role }));
    res.json({ success: true, users: list });
  } catch (err) {
    console.error('User search error:', err);
    res.status(500).json({ success: false, message: 'Unexpected server error' });
  }
});

// Contacts summary for a given username: returns last message per contact (global + PMs)
app.get('/api/chat/contacts', async (req, res) => {
  try {
    const username = (req.query.username || '').toString();
    if (!username) return res.status(400).json({ success: false, message: 'username required' });
    const db = await connectDB();
    // fetch recent messages involving this user (global + pm rooms containing username)
    const recent = await db.collection('chat_messages').find({
      $or: [
        { room: 'global' },
        { room: { $regex: `^pm:` } }
      ],
      $or: [ { sender: username }, { receiver: username }, { room: { $regex: username } } ]
    }).sort({ timestamp: -1 }).limit(500).toArray();

    const contactsMap = new Map();
    for (const m of recent) {
      if (m.room === 'global') {
        if (!contactsMap.has('All')) contactsMap.set('All', { contact: 'All', lastMessage: m.message, timestamp: m.timestamp, room: 'global' });
        continue;
      }
      // room is pm:UserA:UserB
      const parts = (m.room || '').replace(/^pm:/, '').split(':');
      const other = parts.find(p => p !== username) || parts[0] || 'Unknown';
      if (!contactsMap.has(other)) contactsMap.set(other, { contact: other, lastMessage: m.message, timestamp: m.timestamp, room: m.room });
    }

    const contacts = Array.from(contactsMap.values()).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json({ success: true, contacts });
  } catch (err) {
    console.error('chat contacts error:', err);
    res.status(500).json({ success: false, message: 'Unexpected server error' });
  }
});

// ------------- Socket.IO chat & chess -------------
const onlineUsers = new Map(); // socket.id -> { username, role }
const usernameToSockets = new Map(); // username -> Set(socket.id)

// ------------- Socket.IO live match (in-memory) -------------
// This is intentionally in-memory (no schema changes) to keep it minimal and non-invasive.
// Clients still use the existing chessJoin/chessMove events for board sync.
const matchQueue = []; // [{ socketId, username, baseMs, incMs, colorPref, requestedAt }]
const socketToMatchRoom = new Map(); // socket.id -> room
const roomToMatch = new Map(); // room -> { whiteSocketId, blackSocketId, whiteUsername, blackUsername, baseMs, incMs }

// Direct match invites (in-memory)
const matchInvites = new Map(); // inviteId -> { fromSocketId, toSocketId, fromUsername, toUsername, baseMs, incMs, colorPref, createdAt }

function createInviteId() {
  const rnd = Math.random().toString(36).slice(2, 10);
  return `invite:${Date.now()}:${rnd}`;
}
const pendingInvites = new Map(); // targetSocketId -> { fromSocketId, fromUsername, baseMs, incMs, colorPref, createdAt }

function normalizeColorPref(pref) {
  const p = (pref || '').toString().toLowerCase();
  if (p === 'white' || p === 'black') return p;
  return 'random';
}

function createRoomId() {
  const rnd = Math.random().toString(36).slice(2, 10);
  return `match:${Date.now()}:${rnd}`;
}

function removeFromQueue(socketId) {
  const idx = matchQueue.findIndex(q => q.socketId === socketId);
  if (idx >= 0) matchQueue.splice(idx, 1);
}

function socketIsQueued(socketId) {
  return matchQueue.some(q => q && q.socketId === socketId);
}

function getAvailableSocketForUsername(username) {
  const set = usernameToSockets.get(username);
  if (!set || set.size === 0) return null;
  // pick any socket that is not in a match and not queued
  for (const id of set) {
    if (!socketToMatchRoom.has(id) && !socketIsQueued(id)) return id;
  }
  return null;
}

function resolveColors(requesterPref) {
  const pref = normalizeColorPref(requesterPref);
  if (pref === 'white') return { requester: 'white', opponent: 'black' };
  if (pref === 'black') return { requester: 'black', opponent: 'white' };
  const requester = (Math.random() < 0.5) ? 'white' : 'black';
  return { requester, opponent: requester === 'white' ? 'black' : 'white' };
}

function findAndCreateMatch(entry) {
  // Match only with same time control.
  for (let i = 0; i < matchQueue.length; i++) {
    const other = matchQueue[i];
    if (!other) continue;
    if (other.socketId === entry.socketId) continue;
    if (other.username && entry.username && other.username === entry.username) continue;
    if (other.baseMs !== entry.baseMs || other.incMs !== entry.incMs) continue;

    const aPref = normalizeColorPref(entry.colorPref);
    const bPref = normalizeColorPref(other.colorPref);

    // Resolve colors; return null if impossible.
    let entryColor = null;
    let otherColor = null;

    if (aPref === 'random' && bPref === 'random') {
      entryColor = (Math.random() < 0.5) ? 'white' : 'black';
      otherColor = entryColor === 'white' ? 'black' : 'white';
    } else if (aPref !== 'random' && bPref === 'random') {
      entryColor = aPref;
      otherColor = aPref === 'white' ? 'black' : 'white';
    } else if (aPref === 'random' && bPref !== 'random') {
      otherColor = bPref;
      entryColor = bPref === 'white' ? 'black' : 'white';
    } else {
      // both fixed
      if (aPref === bPref) return null; // can't both be white/black
      entryColor = aPref;
      otherColor = bPref;
    }

    // Remove matched other from queue
    matchQueue.splice(i, 1);
    return { other, entryColor, otherColor };
  }
  return null;
}

function broadcastUsers() {
  const unique = Array.from(new Map(Array.from(onlineUsers.values()).map(u => [u.username, u])).values());
  io.emit('updateUsers', unique);
}

function privateRoomName(u1, u2) {
  return `pm:${[u1, u2].sort().join(':')}`;
}

io.on('connection', (socket) => {
  socket.on('join', ({ username, role }) => {
    if (!username) return;
    onlineUsers.set(socket.id, { username, role });
    const set = usernameToSockets.get(username) || new Set();
    set.add(socket.id);
    usernameToSockets.set(username, set);
    broadcastUsers();
  });

  socket.on('disconnect', () => {
    // Remove from match queue (if queued)
    removeFromQueue(socket.id);

    // Remove any pending invites targeting this socket
    pendingInvites.delete(socket.id);

    // Remove invites created by this socket
    for (const [targetId, inv] of pendingInvites.entries()) {
      if (inv && inv.fromSocketId === socket.id) pendingInvites.delete(targetId);
    }

    // If in a live match, notify opponent
    const room = socketToMatchRoom.get(socket.id);
    if (room) {
      const info = roomToMatch.get(room);
      try {
        socket.to(room).emit('matchOpponentLeft');
      } catch (e) {
        // ignore
      }
      if (info) {
        socketToMatchRoom.delete(info.whiteSocketId);
        socketToMatchRoom.delete(info.blackSocketId);
      }
      socketToMatchRoom.delete(socket.id);
      roomToMatch.delete(room);
    }

    const info = onlineUsers.get(socket.id);
    if (info && info.username) {
      const set = usernameToSockets.get(info.username);
      if (set) {
        set.delete(socket.id);
        if (set.size === 0) usernameToSockets.delete(info.username);
        else usernameToSockets.set(info.username, set);
      }
    }
    onlineUsers.delete(socket.id);
    broadcastUsers();

    // Clear any invites where this socket is sender/receiver
    for (const [inviteId, inv] of matchInvites.entries()) {
      if (!inv) continue;
      if (inv.fromSocketId === socket.id || inv.toSocketId === socket.id) {
        matchInvites.delete(inviteId);
        // If receiver disconnected, tell sender (best-effort)
        try {
          if (inv.fromSocketId !== socket.id) {
            const senderSock = io.sockets.sockets.get ? io.sockets.sockets.get(inv.fromSocketId) : io.sockets.sockets[inv.fromSocketId];
            if (senderSock) senderSock.emit('matchInviteCancelled', { inviteId });
          }
        } catch (_) {}
      }
    }
  });

  // Live match request
  socket.on('matchRequest', async ({ username, baseMs, incMs, colorPref }) => {
    const socketInfo = onlineUsers.get(socket.id) || {};
    const actualUsername = (socketInfo.username || username || '').toString().trim();
    if (!actualUsername) return;

    // If already in match, ignore.
    if (socketToMatchRoom.has(socket.id)) return;

    // Normalize inputs (keep strict equality matching)
    const b = Number(baseMs);
    const inc = Number(incMs);
    // Updated limits: 60–120 minutes, increment up to 90 seconds
    const safeBase = Number.isFinite(b) ? Math.max(60 * 60 * 1000, Math.min(120 * 60 * 1000, Math.floor(b))) : 60 * 60 * 1000;
    const safeInc = Number.isFinite(inc) ? Math.max(0, Math.min(90 * 1000, Math.floor(inc))) : 0;
    const pref = normalizeColorPref(colorPref);

    // Ensure not duplicated in queue
    removeFromQueue(socket.id);

    const entry = { socketId: socket.id, username: actualUsername, baseMs: safeBase, incMs: safeInc, colorPref: pref, requestedAt: Date.now() };
    const matched = findAndCreateMatch(entry);
    if (!matched) {
      matchQueue.push(entry);
      socket.emit('matchQueued');
      return;
    }

    const room = createRoomId();
    const otherSocketId = matched.other.socketId;
    const otherSock = io.sockets.sockets.get ? io.sockets.sockets.get(otherSocketId) : io.sockets.sockets[otherSocketId];
    if (!otherSock) {
      // Opponent disappeared; re-queue current
      matchQueue.push(entry);
      socket.emit('matchQueued');
      return;
    }

    // Join both sockets to room
    socket.join(room);
    otherSock.join(room);

    // Determine who is white/black
    const entryIsWhite = matched.entryColor === 'white';
    const whiteSocketId = entryIsWhite ? socket.id : otherSocketId;
    const blackSocketId = entryIsWhite ? otherSocketId : socket.id;
    const whiteUsername = entryIsWhite ? entry.username : matched.other.username;
    const blackUsername = entryIsWhite ? matched.other.username : entry.username;

    socketToMatchRoom.set(socket.id, room);
    socketToMatchRoom.set(otherSocketId, room);
    roomToMatch.set(room, { whiteSocketId, blackSocketId, whiteUsername, blackUsername, baseMs: safeBase, incMs: safeInc });

    // Optional persistence (best-effort)
    try {
      const db = await connectDB();
      await db.collection('games').updateOne(
        { room },
        { $setOnInsert: { room, createdAt: new Date(), baseMs: safeBase, incMs: safeInc, players: { white: whiteUsername, black: blackUsername }, fen: 'start', moves: [] } },
        { upsert: true }
      );
    } catch (e) {
      // ignore persistence errors
    }

    // Notify both
    socket.emit('matchFound', { room, opponent: matched.other.username, color: matched.entryColor, baseMs: safeBase, incMs: safeInc });
    otherSock.emit('matchFound', { room, opponent: entry.username, color: matched.otherColor, baseMs: safeBase, incMs: safeInc });
  });

  // Direct request: send an invite to a specific online player
  socket.on('matchDirectRequest', ({ from, to, baseMs, incMs, colorPref }) => {
    const socketInfo = onlineUsers.get(socket.id) || {};
    const fromUsername = (socketInfo.username || from || '').toString().trim();
    const toUsername = (to || '').toString().trim();
    if (!fromUsername || !toUsername) return;
    if (fromUsername === toUsername) return;
    if (socketToMatchRoom.has(socket.id)) return;

    const b = Number(baseMs);
    const inc = Number(incMs);
    const safeBase = Number.isFinite(b) ? Math.max(60 * 60 * 1000, Math.min(120 * 60 * 1000, Math.floor(b))) : 60 * 60 * 1000;
    const safeInc = Number.isFinite(inc) ? Math.max(0, Math.min(90 * 1000, Math.floor(inc))) : 0;
    const pref = normalizeColorPref(colorPref);

    const receiverSet = usernameToSockets.get(toUsername);
    if (!receiverSet || receiverSet.size === 0) {
      socket.emit('matchInviteCancelled', { reason: 'offline' });
      return;
    }

    // Choose one active socket for receiver
    const toSocketId = Array.from(receiverSet)[0];
    const toSock = io.sockets.sockets.get ? io.sockets.sockets.get(toSocketId) : io.sockets.sockets[toSocketId];
    if (!toSock) {
      socket.emit('matchInviteCancelled', { reason: 'offline' });
      return;
    }

    // Receiver already in match -> can't invite
    if (socketToMatchRoom.has(toSocketId)) {
      socket.emit('matchInviteCancelled', { reason: 'busy' });
      return;
    }

    const inviteId = createInviteId();
    matchInvites.set(inviteId, { fromSocketId: socket.id, toSocketId, fromUsername, toUsername, baseMs: safeBase, incMs: safeInc, colorPref: pref, createdAt: Date.now() });

    // Notify sender + receiver
    socket.emit('matchRequestSent', { inviteId });
    toSock.emit('matchInvite', { inviteId, from: fromUsername, baseMs: safeBase, incMs: safeInc, colorPref: pref });
  });

  socket.on('matchInviteDecline', ({ inviteId }) => {
    if (!inviteId) return;
    const inv = matchInvites.get(inviteId);
    if (!inv) return;
    // Only receiver can decline
    if (inv.toSocketId !== socket.id) return;
    matchInvites.delete(inviteId);
    const fromSock = io.sockets.sockets.get ? io.sockets.sockets.get(inv.fromSocketId) : io.sockets.sockets[inv.fromSocketId];
    if (fromSock) fromSock.emit('matchInviteCancelled', { inviteId, reason: 'declined' });
  });

  socket.on('matchInviteAccept', async ({ inviteId }) => {
    if (!inviteId) return;
    const inv = matchInvites.get(inviteId);
    if (!inv) return;
    // Only receiver can accept
    if (inv.toSocketId !== socket.id) return;

    // Both must still be online and not already in match
    const fromSock = io.sockets.sockets.get ? io.sockets.sockets.get(inv.fromSocketId) : io.sockets.sockets[inv.fromSocketId];
    const toSock = io.sockets.sockets.get ? io.sockets.sockets.get(inv.toSocketId) : io.sockets.sockets[inv.toSocketId];
    if (!fromSock || !toSock) {
      matchInvites.delete(inviteId);
      return;
    }
    if (socketToMatchRoom.has(inv.fromSocketId) || socketToMatchRoom.has(inv.toSocketId)) {
      matchInvites.delete(inviteId);
      try { toSock.emit('matchInviteCancelled', { inviteId, reason: 'busy' }); } catch (_) {}
      try { fromSock.emit('matchInviteCancelled', { inviteId, reason: 'busy' }); } catch (_) {}
      return;
    }

    matchInvites.delete(inviteId);

    // Resolve colors
    const aPref = normalizeColorPref(inv.colorPref);
    let fromColor = 'white';
    let toColor = 'black';
    if (aPref === 'white') { fromColor = 'white'; toColor = 'black'; }
    else if (aPref === 'black') { fromColor = 'black'; toColor = 'white'; }
    else {
      fromColor = (Math.random() < 0.5) ? 'white' : 'black';
      toColor = fromColor === 'white' ? 'black' : 'white';
    }

    const room = createRoomId();
    fromSock.join(room);
    toSock.join(room);
    socketToMatchRoom.set(inv.fromSocketId, room);
    socketToMatchRoom.set(inv.toSocketId, room);

    const whiteSocketId = fromColor === 'white' ? inv.fromSocketId : inv.toSocketId;
    const blackSocketId = fromColor === 'white' ? inv.toSocketId : inv.fromSocketId;
    const whiteUsername = fromColor === 'white' ? inv.fromUsername : inv.toUsername;
    const blackUsername = fromColor === 'white' ? inv.toUsername : inv.fromUsername;
    roomToMatch.set(room, { whiteSocketId, blackSocketId, whiteUsername, blackUsername, baseMs: inv.baseMs, incMs: inv.incMs });

    // Optional persistence
    try {
      const db = await connectDB();
      await db.collection('games').updateOne(
        { room },
        { $setOnInsert: { room, createdAt: new Date(), baseMs: inv.baseMs, incMs: inv.incMs, players: { white: whiteUsername, black: blackUsername }, fen: 'start', moves: [] } },
        { upsert: true }
      );
    } catch (e) {
      // ignore
    }

    // Notify both
    fromSock.emit('matchFound', { room, opponent: inv.toUsername, color: fromColor, baseMs: inv.baseMs, incMs: inv.incMs });
    toSock.emit('matchFound', { room, opponent: inv.fromUsername, color: toColor, baseMs: inv.baseMs, incMs: inv.incMs });
  });

  // Direct invite flow: request a specific opponent
  socket.on('matchDirectRequest', ({ username, targetUsername, baseMs, incMs, colorPref }) => {
    const socketInfo = onlineUsers.get(socket.id) || {};
    const actualUsername = (socketInfo.username || username || '').toString().trim();
    const target = (targetUsername || '').toString().trim();
    if (!actualUsername || !target) return;
    if (actualUsername === target) return;
    if (socketToMatchRoom.has(socket.id)) return;

    const b = Number(baseMs);
    const inc = Number(incMs);
    const safeBase = Number.isFinite(b) ? Math.max(60 * 60 * 1000, Math.min(120 * 60 * 1000, Math.floor(b))) : 60 * 60 * 1000;
    const safeInc = Number.isFinite(inc) ? Math.max(0, Math.min(90 * 1000, Math.floor(inc))) : 0;
    const pref = normalizeColorPref(colorPref);

    // inviter should not be queued (direct request is separate)
    removeFromQueue(socket.id);

    const targetSocketId = getAvailableSocketForUsername(target);
    if (!targetSocketId) {
      socket.emit('matchInviteResult', { ok: false, reason: 'Player not available' });
      return;
    }

    // Store invite for target socket
    pendingInvites.set(targetSocketId, {
      fromSocketId: socket.id,
      fromUsername: actualUsername,
      baseMs: safeBase,
      incMs: safeInc,
      colorPref: pref,
      createdAt: Date.now()
    });

    const targetSock = io.sockets.sockets.get ? io.sockets.sockets.get(targetSocketId) : io.sockets.sockets[targetSocketId];
    if (targetSock && targetSock.emit) {
      targetSock.emit('matchInvite', { from: actualUsername, baseMs: safeBase, incMs: safeInc, colorPref: pref });
      socket.emit('matchInviteResult', { ok: true });
    } else {
      pendingInvites.delete(targetSocketId);
      socket.emit('matchInviteResult', { ok: false, reason: 'Player not available' });
    }
  });

  socket.on('matchInviteAccept', async ({ fromUsername }) => {
    const inv = pendingInvites.get(socket.id);
    if (!inv) return;
    const fromInfo = onlineUsers.get(inv.fromSocketId);
    const expectedFromName = (inv.fromUsername || (fromInfo && fromInfo.username) || '').toString();
    if (fromUsername && expectedFromName && fromUsername.toString() !== expectedFromName) return;

    // Ensure both are still available
    if (socketToMatchRoom.has(socket.id) || socketToMatchRoom.has(inv.fromSocketId)) {
      pendingInvites.delete(socket.id);
      return;
    }

    const inviterSock = io.sockets.sockets.get ? io.sockets.sockets.get(inv.fromSocketId) : io.sockets.sockets[inv.fromSocketId];
    if (!inviterSock) {
      pendingInvites.delete(socket.id);
      return;
    }

    const room = createRoomId();
    const colors = resolveColors(inv.colorPref);

    // Join both sockets to room
    socket.join(room);
    inviterSock.join(room);

    // Determine who is white/black
    const inviterIsWhite = colors.requester === 'white';
    const whiteSocketId = inviterIsWhite ? inv.fromSocketId : socket.id;
    const blackSocketId = inviterIsWhite ? socket.id : inv.fromSocketId;
    const whiteUsername = inviterIsWhite ? inv.fromUsername : (onlineUsers.get(socket.id)?.username || '');
    const blackUsername = inviterIsWhite ? (onlineUsers.get(socket.id)?.username || '') : inv.fromUsername;

    socketToMatchRoom.set(socket.id, room);
    socketToMatchRoom.set(inv.fromSocketId, room);
    roomToMatch.set(room, { whiteSocketId, blackSocketId, whiteUsername, blackUsername, baseMs: inv.baseMs, incMs: inv.incMs });

    pendingInvites.delete(socket.id);

    // Optional persistence
    try {
      const db = await connectDB();
      await db.collection('games').updateOne(
        { room },
        { $setOnInsert: { room, createdAt: new Date(), baseMs: inv.baseMs, incMs: inv.incMs, players: { white: whiteUsername, black: blackUsername }, fen: 'start', moves: [] } },
        { upsert: true }
      );
    } catch (e) {
      // ignore
    }

    // Notify both
    inviterSock.emit('matchFound', { room, opponent: onlineUsers.get(socket.id)?.username || 'Opponent', color: colors.requester, baseMs: inv.baseMs, incMs: inv.incMs });
    socket.emit('matchFound', { room, opponent: inv.fromUsername, color: colors.opponent, baseMs: inv.baseMs, incMs: inv.incMs });
  });

  socket.on('matchInviteDecline', ({ fromUsername }) => {
    const inv = pendingInvites.get(socket.id);
    if (!inv) return;
    pendingInvites.delete(socket.id);
    const inviterSock = io.sockets.sockets.get ? io.sockets.sockets.get(inv.fromSocketId) : io.sockets.sockets[inv.fromSocketId];
    if (inviterSock && inviterSock.emit) inviterSock.emit('matchInviteDeclined', { by: onlineUsers.get(socket.id)?.username || 'Opponent', from: fromUsername || inv.fromUsername });
  });

  socket.on('matchCancel', () => {
    removeFromQueue(socket.id);
    socket.emit('matchCancelled');
  });

  socket.on('matchLeave', () => {
    const room = socketToMatchRoom.get(socket.id);
    if (!room) return;
    try {
      socket.to(room).emit('matchOpponentLeft');
    } catch (e) {
      // ignore
    }
    const info = roomToMatch.get(room);
    if (info) {
      socketToMatchRoom.delete(info.whiteSocketId);
      socketToMatchRoom.delete(info.blackSocketId);
    }
    socketToMatchRoom.delete(socket.id);
    roomToMatch.delete(room);
    try { socket.leave(room); } catch (_) {}
  });

  // Chat messaging
  socket.on('chatMessage', async ({ sender, receiver, message }) => {
    const socketInfo = onlineUsers.get(socket.id) || {};
    const actualSender = socketInfo.username || sender;
    if (!actualSender || !message) return;
    const payload = { sender: actualSender, message, receiver: receiver || 'All' };
    const db = await connectDB();
    try {
      if (!receiver || receiver === 'All') {
        io.emit('message', payload);
        await db.collection('chat_messages').insertOne({ room: 'global', sender: actualSender, message, timestamp: new Date() });
      } else {
        const room = privateRoomName(actualSender, receiver);
        const senderSet = usernameToSockets.get(actualSender) || new Set();
        const receiverSet = usernameToSockets.get(receiver) || new Set();
        const allIds = new Set([...senderSet, ...receiverSet]);
        for (const id of allIds) {
          const s = io.sockets.sockets.get ? io.sockets.sockets.get(id) : io.sockets.sockets[id];
          if (s && s.emit) s.emit('message', payload);
        }
        await db.collection('chat_messages').insertOne({ room, sender: actualSender, receiver, message, timestamp: new Date() });
      }
    } catch (e) {
      console.error('chatMessage error:', e);
    }
  });

  // Chess events
  socket.on('chessJoin', ({ room }) => {
    if (!room) return;
    socket.join(room);
  });

  socket.on('chessMove', async ({ room, move }) => {
    if (!room || !move) return;
    socket.to(room).emit('chessMove', move);
    try {
      const db = await connectDB();
      await db.collection('games').updateOne({ room }, { $push: { moves: { ...move, timestamp: new Date() } }, $set: { fen: move.fen, updatedAt: new Date() } }, { upsert: true });
    } catch (e) {
      // ignore persistence errors for now
      console.error('chessMove persist error:', e);
    }
  });
});

// 404 handler
// For API requests: return JSON.
// For browser navigation: redirect to SPA error page.
app.use((req, res) => {
  const wantsJson = (req.path && req.path.startsWith('/api')) || req.xhr || (req.accepts && req.accepts('json'));
  if (wantsJson) {
    return res.status(404).json({ success: false, message: 'Not Found' });
  }

  const isDev = (process.env.NODE_ENV || 'development') !== 'production';
  const origin = req.get('origin');
  const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];
  const clientBase = process.env.CLIENT_ORIGIN
    || (origin && allowedOrigins.includes(origin) ? origin : null)
    || (isDev ? 'http://localhost:3000' : '');

  // Avoid redirect loops if someone hits backend /error directly.
  if (req.path === '/error') {
    return res.status(404).send('Not Found');
  }

  const qs = 'title=Not%20Found&message=The%20page%20you%20requested%20does%20not%20exist.&code=404';
  return res.status(404).redirect(`${clientBase}/error?${qs}`);
});

// Error-handling middleware (must have 4 args)
// Ensures unexpected errors return a consistent response instead of crashing the server.
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  if (res.headersSent) return next(err);

  const status = (err && (err.status || err.statusCode)) ? (err.status || err.statusCode) : 500;
  const wantsJson = (req.path && req.path.startsWith('/api')) || req.xhr || (req.accepts && req.accepts('json'));
  const message = (err && err.message) ? err.message : 'Internal Server Error';

  if (wantsJson) {
    return res.status(status).json({ success: false, message });
  }

  // Redirect non-API requests to SPA error page
  const isDev = (process.env.NODE_ENV || 'development') !== 'production';
  const origin = req.get('origin');
  const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];
  const clientBase = process.env.CLIENT_ORIGIN
    || (origin && allowedOrigins.includes(origin) ? origin : null)
    || (isDev ? 'http://localhost:3000' : '');

  const safeTitle = encodeURIComponent('Error');
  const safeMsg = encodeURIComponent(message);
  const safeCode = encodeURIComponent(String(status));
  return res.status(status).redirect(`${clientBase}/error?title=${safeTitle}&message=${safeMsg}&code=${safeCode}`);
});

connectDB().catch(err => console.error('Database connection failed:', err));
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// --- Tournament status scheduler: mark Ongoing and auto-complete after 1 hour ---
(function scheduleTournamentStatusUpdater() {
  async function tick() {
    try {
      const db = await connectDB();
      const now = new Date();
      const list = await db.collection('tournaments').find({ status: { $in: ['Approved', 'Ongoing'] } }).toArray();
      const toOngoing = [];
      const toCompleted = [];
      for (const t of list) {
        if (!t || !t.date) continue;
        const dateOnly = new Date(t.date);
        const timeStr = (t.time || '00:00').toString();
        const [hh, mm] = (timeStr.match(/^\d{2}:\d{2}$/) ? timeStr.split(':') : ['00', '00']);
        const start = new Date(dateOnly);
        start.setHours(parseInt(hh, 10) || 0, parseInt(mm, 10) || 0, 0, 0);
        const end = new Date(start.getTime() + 60 * 60 * 1000);

        if (now >= end) {
          if (t.status !== 'Completed') toCompleted.push(t._id);
        } else if (now >= start && now < end) {
          if (t.status !== 'Ongoing') toOngoing.push(t._id);
        }
      }
      if (toOngoing.length) {
        await db.collection('tournaments').updateMany(
          { _id: { $in: toOngoing } },
          { $set: { status: 'Ongoing' } }
        );
      }
      if (toCompleted.length) {
        await db.collection('tournaments').updateMany(
          { _id: { $in: toCompleted } },
          { $set: { status: 'Completed', completed_at: new Date() } }
        );
      }
    } catch (e) {
      console.error('Tournament status scheduler error:', e);
    }
  }
  // run immediately and every minute
  tick();
  setInterval(tick, 60 * 1000);
})();