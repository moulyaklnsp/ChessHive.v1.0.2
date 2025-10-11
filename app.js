const express = require('express');
const path = require('path');
const session = require('express-session');
const authrouter = require('./routes/auth');
const methodOverride = require('method-override');
const { connectDB } = require('./routes/databasecongi');

const adminRouter = require('./admin_app');
const organizerRouter = require('./organizer_app');
const coordinatorRouter = require('./coordinator_app');
const playerRouter = require('./player_app');

const utils = require('./utils');
const { ObjectId } = require('mongodb');

const app = express();
const PORT = 3000;

app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // For parsing JSON from API requests
app.use(methodOverride('_method'));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(authrouter);

// ---------- Role Middleware ----------
const isAdmin = (req, res, next) => { 
  if (req.session.userRole === 'admin') next(); 
  else res.status(403).send('Unauthorized'); 
};
const isOrganizer = (req, res, next) => { 
  if (req.session.userRole === 'organizer') next(); 
  else res.status(403).send('Unauthorized'); 
};
const isCoordinator = (req, res, next) => { 
  if (req.session.userRole === 'coordinator') next(); 
  else res.status(403).send('Unauthorized'); 
};
const isPlayer = (req, res, next) => { 
  if (req.session.userRole === 'player') next(); 
  else res.status(403).send('Unauthorized'); 
};
const isAdminOrOrganizer = (req, res, next) => { 
  if (req.session.userRole === 'admin' || req.session.userRole === 'organizer') next(); 
  else res.status(403).json({ success: false, message: 'Unauthorized' }); 
};

// ---------- Mount Routers ----------
app.use('/admin', isAdmin, adminRouter);
app.use('/organizer', isOrganizer, organizerRouter);
app.use('/coordinator', isCoordinator, coordinatorRouter);
app.use('/player', isPlayer, playerRouter.router);

// ---------- Serve index.html ----------
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/favicon.ico', (req, res) => res.status(204).end());

// API endpoint for login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const db = await connectDB();
    const user = await db.collection('users').findOne({ email, password });
    if (!user) {
      console.log('Login failed: Invalid credentials for', email);
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }
    if (user.isDeleted) {
      console.log('Login failed: Account deleted for', email);
      return res.status(403).json({
        success: false,
        message: 'Account has been deleted',
        deletedUserId: user._id.toString(),
        deletedUserRole: user.role
      });
    }
    req.session.userID = user._id;
    req.session.userEmail = user.email;
    req.session.userRole = user.role;
    req.session.username = user.name;
    req.session.playerName = user.name;
    req.session.userCollege = user.college;
    req.session.collegeName = user.college;
    console.log(`User logged in: ${email} as ${user.role}`);

    let redirectUrl = '';
    switch (user.role) {
      case 'admin':
        redirectUrl = '/admin/admin_dashboard';
        break;
      case 'organizer':
        redirectUrl = '/organizer/organizer_dashboard';
        break;
      case 'coordinator':
        redirectUrl = '/coordinator/coordinator_dashboard';
        break;
      case 'player':
        redirectUrl = '/player/player_dashboard?success-message=Player Login Successful';
        break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid Role' });
    }
    res.json({ success: true, redirectUrl });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'An unexpected error occurred' });
  }
});

// API endpoint for signup
app.post('/api/signup', async (req, res) => {
  const {
    name, email, dob, gender, college, phone, password, role, aicf_id, fide_id
  } = req.body;

  // Log the incoming data for debugging
  console.log('Received data:', req.body);

  try {
    // Validate dob
    console.log(dob);
    if (!dob || isNaN(new Date(dob).getTime())) {
      throw new Error('Invalid date of birth');
    }

    const newUser = {
      name: name || '',
      email: email || '',
      password: password || '', // Hash this in production
      role: role || '',
      isDeleted: 0, // Required field
      dob: new Date(dob), // Convert to Date
      gender: gender || '',
      college: college || '',
      phone: phone || '',
      AICF_ID: aicf_id || '', // Default to empty string if not provided
      FIDE_ID: fide_id || ''  // Default to empty string if not provided
    };

    const db = await connectDB();
    const result = await db.collection('users').insertOne(newUser);
    if (result.insertedId) {
      console.log(`User signed up: ${email} as ${role}`);
      res.json({
        success: true,
        message: 'Signup successful! Redirecting to login...',
        redirectUrl: '/login'
      });
    } else {
      res.json({ success: false, message: 'Failed to create user' });
    }
  } catch (err) {
    console.error('Signup error:', err);
    if (err.code === 121) {
      res.status(400).json({ success: false, message: 'Data validation failed. Please check your input.' });
    } else if (err.code === 11000) {
      res.status(400).json({ success: false, message: 'Email already exists.' });
    } else {
      res.status(500).json({ success: false, message: 'An unexpected error occurred' });
    }
  }
});

// API endpoint for contact us
app.post('/api/contactus', async (req, res) => {
  const { name, email, message } = req.body || {};
  console.log("Raw req.body:", req.body);
  console.log("Destructured:", { name, email, message });
  let errors = {};

  // Validate name
  if (!name || !/^[A-Za-z]+(?: [A-Za-z]+)*$/.test(name)) {
    errors.name = "Name should only contain letters";
  }

  // Validate email
  if (!email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
    errors.email = "Please enter a valid email address";
  }

  // Validate message
  if (!message || message.trim() === '') {
    errors.message = "Message cannot be empty";
  } else {
    const wordCount = message.trim().split(/\s+/).length;
    if (wordCount > 200) {
      errors.message = "Message cannot exceed 200 words";
    }
  }

  // If there are any validation errors, return them
  if (Object.keys(errors).length > 0) {
    console.log('Contact us validation errors:', errors);
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }

  // Connect to database and check if user is a registered player (commented out as per original)
  try {
    const db = await connectDB();
    // const user = await db.collection('users').findOne({ name, email, role: 'player', isDeleted: 0 });
    // if (!user) {
    //   return res.status(403).json({ success: false, message: 'Only registered players can submit messages. Please sign up or use a player account.' });
    // }

    // Insert the message into the database
    await db.collection('contact').insertOne({ name, email, message, submission_date: new Date() });
    console.log('Contact message submitted:', { name, email });

    // Log current contact table contents
    const contacts = await db.collection('contact').find().toArray();
    console.log("\n=== Current Contact Table Contents ===");
    console.log("Total rows:", contacts.length);
    console.table(contacts);
    console.log("=====================================\n");

    res.json({ success: true, message: 'Message sent successfully!' });
  } catch (err) {
    console.error('Contact error:', err);
    res.status(500).json({ success: false, message: 'An unexpected error occurred' });
  }
});

// ---------- RESTORE PLAYER ----------
app.post('/players/restore/:id', async (req, res) => {
  const { id } = req.params;
  const db = await connectDB();
  try {
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(id), role: 'player' },
      { $set: { isDeleted: 0, deleted_date: null, deleted_by: null } }
    );

    if (result.matchedCount === 0) {
      console.log('Restore failed: Player not found:', id);
      return res.status(404).json({ message: 'Player not found' });
    }

    console.log(`Player account restored: ${id}`);
    await db.collection('logs').insertOne({
      action: 'player_restore',
      userId: id,
      success: true,
      timestamp: new Date()
    });

    res.json({ message: 'Player account restored successfully' });
  } catch (err) {
    console.error('Restore error:', err);
    await db.collection('logs').insertOne({
      action: 'player_restore',
      userId: id,
      success: false,
      error: err.message,
      timestamp: new Date()
    });

    if (err.code === 121)
      return res.status(400).json({ message: 'Validation error during restore' });

    res.status(500).json({ message: 'Unexpected server error' });
  }
});

// ---------- RESTORE COORDINATOR ----------
app.post('/coordinators/restore/:id', async (req, res) => {
  const { id } = req.params;
  const { email, password } = req.body;
  const db = await connectDB();

  try {
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(id), role: 'coordinator' },
      { $set: { isDeleted: 0, deleted_date: null, deleted_by: null } }
    );

    if (result.matchedCount === 0) {
      console.log('Restore failed: Coordinator not found:', id);
      return res.status(404).json({ message: 'Coordinator not found' });
    }

    console.log(`Coordinator account restored: ${id}, ${email}`);
    await db.collection('logs').insertOne({
      action: 'coordinator_restore',
      userId: id,
      email,
      success: true,
      timestamp: new Date()
    });

    res.json({ message: 'Coordinator account restored successfully' });
  } catch (err) {
    console.error('Restore error:', err);
    await db.collection('logs').insertOne({
      action: 'coordinator_restore',
      userId: id,
      email,
      success: false,
      error: err.message,
      timestamp: new Date()
    });
    res.status(500).json({ message: 'Unexpected server error' });
  }
});

// ---------- RESTORE ORGANIZER ----------
app.post('/organizers/restore/:id', async (req, res) => {
  const { id } = req.params;
  const { email } = req.body;
  const db = await connectDB();

  try {
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(id), role: 'organizer' },
      { $set: { isDeleted: 0, deleted_date: null, deleted_by: null } }
    );

    if (result.matchedCount === 0) {
      console.log('Restore failed: Organizer not found:', id);
      return res.status(404).json({ message: 'Organizer not found' });
    }

    console.log(`Organizer account restored: ${id}, ${email}`);
    await db.collection('logs').insertOne({
      action: 'organizer_restore',
      userId: id,
      email,
      success: true,
      timestamp: new Date()
    });

    res.json({ message: 'Organizer account restored successfully' });
  } catch (err) {
    console.error('Restore error:', err);
    await db.collection('logs').insertOne({
      action: 'organizer_restore',
      userId: id,
      email,
      success: false,
      error: err.message,
      timestamp: new Date()
    });
    res.status(500).json({ message: 'Unexpected server error' });
  }
});

// ---------- Dynamic Page Renderer ----------
app.get('/:page', (req, res) => {
  const { page } = req.params;
  const filePath = path.join(__dirname, 'views', `${page}.html`);
  console.log('Requested page:', filePath);

  res.sendFile(filePath, (err) => {
    if (err) res.status(404).send(`Page not found: ${page}`);
  });
});

// ---------- API Data Fetch ----------
app.get('/api/:pageData', (req, res) => {
  const messages = utils.getMessages(req);
  res.json({
    ...messages,
    deletedUserId: req.query.deletedUserId || null
  });
});

// ---------- 404 Handler ----------
app.use((req, res) => res.status(404).redirect('/?error-message=Page not found'));

connectDB().catch(err => console.error('Database connection failed:', err));
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));