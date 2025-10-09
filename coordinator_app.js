const express = require('express');
const router = express.Router();
const { connectDB } = require('./routes/databasecongi');
const moment = require('moment');
const utils = require('./utils');
const { ObjectId } = require('mongodb');
const path = require('path'); 

class Player {
  constructor(id, username, college, gender) {
    this.id = id;
    this.username = username;
    this.college = college;
    this.gender = gender;
    this.score = 0;
    this.opponents = new Set();
  }
}

function swissPairing(players, totalRounds) {
  let allRounds = [];
  for (let round = 1; round <= totalRounds; round++) {
    console.log(`Round ${round}: Starting with ${players.length} players`);
    players.sort((a, b) => b.score - a.score);
    let pairings = [];
    let byePlayer = null;
    let paired = new Set();
    if (players.length % 2 !== 0) {
      byePlayer = players.pop();
      byePlayer.score += 1;
      console.log(`Round ${round}: Bye player is ${byePlayer.username}`);
    }
    console.log(`Round ${round}: Players to pair: ${players.map(p => p.username).join(", ")}`);
    for (let i = 0; i < players.length; i++) {
      if (paired.has(players[i].id)) continue;
      let player1 = players[i];
      let player2 = null;
      for (let j = i + 1; j < players.length; j++) {
        if (!paired.has(players[j].id) && !player1.opponents.has(players[j].id)) {
          player2 = players[j];
          break;
        }
      }
      if (!player2) {
        for (let j = i + 1; j < players.length; j++) {
          if (!paired.has(players[j].id)) {
            player2 = players[j];
            break;
          }
        }
      }
      if (player2) {
        paired.add(player1.id);
        paired.add(player2.id);
        player1.opponents.add(player2.id);
        player2.opponents.add(player1.id);
        let result = Math.random();
        let matchResult;
        if (result < 0.4) {
          player1.score += 1;
          matchResult = `${player1.username} Wins`;
        } else if (result < 0.8) {
          player2.score += 1;
          matchResult = `${player2.username} Wins`;
        } else {
          player1.score += 0.5;
          player2.score += 0.5;
          matchResult = "Draw";
        }
        pairings.push({ player1, player2, result: matchResult });
        console.log(`Round ${round}: Paired ${player1.username} vs ${player2.username} - ${matchResult}`);
      } else {
        console.log(`Round ${round}: Could not find a match for ${player1.username}`);
      }
    }
    if (byePlayer) players.push(byePlayer);
    allRounds.push({ round, pairings, byePlayer });
    console.log(`Round ${round}: Pairings created: ${pairings.length}`);
  }
  return allRounds;
}

router.use(express.json());

// Name API
router.get('/api/name', async (req, res) => {
  try {
    const db = await connectDB();
    const coordinator = await db.collection('users').findOne({ 
      email: req.session.userEmail,
      role: 'coordinator' 
    });
    res.json({ name: coordinator?.name || 'Coordinator' });
  } catch (error) {
    console.error('Error fetching name:', error);
    res.status(500).json({ error: 'Failed to fetch name' });
  }
});

// Dashboard API
router.get('/api/dashboard', async (req, res) => {
  try {
    const db = await connectDB();
    const today = new Date();
    const threeDaysLater = moment().add(3, 'days').toDate();
    const username = req.session.username || req.session.userEmail;
    const meetings = await db.collection('meetingsdb')
      .find({ 
        date: { $gte: today, $lte: threeDaysLater },
        name: { $ne: username }
      })
      .sort({ date: 1, time: 1 })
      .toArray();
    const coordinator = await db.collection('users').findOne({ 
      email: req.session.userEmail,
      role: 'coordinator' 
    });
    res.json({
      coordinatorName: coordinator?.name || 'Coordinator',
      meetings: meetings || []
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Profile API
router.get('/api/profile', async (req, res) => {
  try {
    const db = await connectDB();
    const coordinator = await db.collection('users').findOne({ 
      email: req.session.userEmail,
      role: 'coordinator' 
    });

    if (!coordinator) {
      return res.status(404).json({ error: 'Coordinator not found' });
    }

    res.json({
      name: coordinator.name,
      email: coordinator.email,
      college: coordinator.college || 'N/A'
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Delete Account API
router.delete('/api/profile', async (req, res) => {
  try {
    const db = await connectDB();
    const username = req.session.username || req.session.userEmail;

    const result = await db.collection('users').updateOne(
      { email: req.session.userEmail, role: 'coordinator' },
      { $set: { isDeleted: 1, deleted_date: new Date(), deleted_by: username } }
    );

    if (result.modifiedCount > 0) {
      console.log('Account deleted:', req.session.userEmail);
      // Clear session
      req.session.destroy((err) => {
        if (err) console.error('Error destroying session:', err);
      });
      res.json({ success: true, message: 'Account deleted successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Account not found' });
    }
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ success: false, message: 'Failed to delete account' });
  }
});

// Tournament APIs
router.get('/api/tournaments', async (req, res) => {
  try {
    const db = await connectDB();
    const user = await db.collection('users').findOne({ 
      email: req.session.userEmail,
      role: 'coordinator' 
    });
    if (!user) {
      console.log('User not found for tournaments fetch');
      return res.status(401).json({ error: 'User not logged in' });
    }
    const username = user.name || req.session.userEmail;
    
    console.log('Fetching tournaments for username:', username);
    
    const tournaments = await db.collection('tournaments')
      .find({ coordinator: username })
      .sort({ date: -1 })
      .toArray();

    console.log('Fetched tournaments count:', tournaments.length);

    res.json({ tournaments: tournaments || [] });
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    res.status(500).json({ error: 'Failed to fetch tournaments' });
  }
});

router.post('/api/tournaments', async (req, res) => {
  try {
    const { tournamentName, tournamentDate, time, location, entryFee, type, noOfRounds } = req.body;
    console.log('POST body received:', req.body);

    const db = await connectDB();
    const user = await db.collection('users').findOne({ 
      email: req.session.userEmail,
      role: 'coordinator' 
    });
    if (!user) {
      console.log('User not found in DB');
      return res.status(401).json({ success: false, message: 'User not logged in' });
    }
    const username = user.name || req.session.userEmail;
    const college = user.college;

    const tournament = {
      name: tournamentName.toString().trim(),
      date: new Date(tournamentDate),
      time: time.toString().trim(),
      location: location.toString().trim(),
      entry_fee: parseFloat(entryFee),
      type: type.toString().trim(),
      noOfRounds: parseInt(noOfRounds),
      coordinator: username.toString(),
      status: 'Pending',
      added_by: username.toString(),
      submitted_date: new Date()
    };

    console.log('Tournament to insert:', tournament);

    const result = await db.collection('tournaments').insertOne(tournament);
    if (result.insertedId) {
      console.log('Tournament added successfully:', tournamentName);
      return res.json({ success: true, message: 'Tournament added successfully' });
    } else {
      console.log('Insert failed: No insertedId');
      return res.status(500).json({ success: false, message: 'Failed to add tournament' });
    }
  } catch (error) {
    console.error('Full validation error:', JSON.stringify(error, null, 2));
    console.error('Error details array:', JSON.stringify(error.errInfo?.details || 'No details', null, 2));
    return res.status(500).json({ success: false, error: 'Failed to add tournament' });
  }
});

router.delete('/api/tournaments/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const username = req.session.username || req.session.userEmail;
    const result = await (await connectDB()).collection('tournaments').updateOne(
      { _id: new ObjectId(id), coordinator: username },
      { $set: { status: 'Removed', removed_date: new Date(), removed_by: username } }
    );

    if (result.modifiedCount > 0) {
      console.log('Tournament removed:', id);
      res.json({ success: true, message: 'Tournament removed successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Tournament not found' });
    }
  } catch (error) {
    console.error('Error removing tournament:', error);
    res.status(500).json({ success: false, error: 'Failed to remove tournament' });
  }
});

// Store APIs
router.get('/api/store/products', async (req, res) => {
  try {
    const db = await connectDB();
    const college = req.session.userCollege || req.session.collegeName;
    const products = await db.collection('products')
      .find({ college: college })
      .toArray();
    
    res.json({ products: products || [] });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.post('/api/store/addproducts', async (req, res) => {
  try {
    const { productName, productCategory, price, imageUrl, availability } = req.body;
    console.log('POST body received:', req.body);
    console.log('Session data:', { userEmail: req.session.userEmail, userCollege: req.session.userCollege, collegeName: req.session.collegeName });

    if (!productName || !productCategory || !price || !imageUrl || availability === undefined) {
      console.log('Validation failed: Missing fields');
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const db = await connectDB();
    const user = await db.collection('users').findOne({ 
      email: req.session.userEmail,
      role: 'coordinator' 
    });
    if (!user) {
      console.log('User not found in DB');
      return res.status(401).json({ success: false, message: 'User not logged in' });
    }
    const username = user.name || req.session.userEmail;
    const college = user.college || req.session.userCollege || req.session.collegeName;

    if (!college) {
      console.log('College not found');
      return res.status(401).json({ success: false, message: 'College info missing' });
    }

    const product = {
      name: productName.toString(),
      category: productCategory.toString(),
      price: parseFloat(price),
      image_url: imageUrl.toString(),
      availability: parseInt(availability) || 0,
      college: college.toString(),
      coordinator: username.toString(),
      added_date: new Date()
    };
    console.log('Product to insert:', product);

    const result = await db.collection('products').insertOne(product);
    if (result.insertedId) {
      console.log('Product added successfully:', productName);
      return res.json({ success: true, message: 'Product added successfully' });
    } else {
      console.log('Insert failed: No insertedId');
      return res.status(500).json({ success: false, message: 'Failed to add product' });
    }
  } catch (error) {
    console.error('Full validation error:', JSON.stringify(error, null, 2));
    return res.status(500).json({ success: false, error: 'Failed to add product' });
  }
});

// Meetings APIs
router.post('/api/meetings', async (req, res) => {
  try {
    const { title, date, time, link } = req.body;
    console.log('Request body:', req.body);

    const userName = req.session.username || req.session.userEmail;
    if (!userName) {
      return res.status(401).json({ success: false, message: 'User not logged in' });
    }

    const meeting = {
      title: title.toString(),
      date: new Date(date),
      time: time.toString(),
      link: link.toString(),
      role: 'coordinator',
      name: userName.toString()
    };

    console.log('Meeting to insert:', meeting); 

    const result = await (await connectDB()).collection('meetingsdb').insertOne(meeting);

    if (result.insertedId) {
      console.log('Meeting scheduled:', title);
      return res.json({ success: true, message: 'Meeting scheduled successfully' });
    } else {
      return res.status(500).json({ success: false, message: 'Failed to schedule meeting' });
    }
  } catch (error) {
    console.error('Error scheduling meeting:', error);
    return res.status(500).json({ success: false, error: 'Failed to schedule meeting' });
  }
});

router.get('/api/meetings/organized', async (req, res) => {
  try {
    const db = await connectDB();
    const username = req.session.username || req.session.userEmail;
    const meetings = await db.collection('meetingsdb')
      .find({ 
        role: 'coordinator',
        name: username 
      })
      .sort({ date: 1, time: 1 })
      .toArray();
    
    res.json(meetings);
  } catch (error) {
    console.error('Error fetching organized meetings:', error);
    res.status(500).json({ error: 'Failed to fetch organized meetings' });
  }
});

router.get('/api/meetings/upcoming', async (req, res) => {
  try {
    const db = await connectDB();
    const today = new Date();
    const threeDaysLater = moment().add(3, 'days').toDate();
    const username = req.session.username || req.session.userEmail;
    
    const meetings = await db.collection('meetingsdb')
      .find({ 
        date: { $gte: today, $lte: threeDaysLater },
        name: { $ne: username }
      })
      .sort({ date: 1, time: 1 })
      .toArray();
    
    res.json(meetings);
  } catch (error) {
    console.error('Error fetching upcoming meetings:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming meetings' });
  }
});

// Player Stats API
router.get('/api/player-stats', async (req, res) => {
  try {
    const db = await connectDB();
    const college = req.session.collegeName || req.session.userCollege;
    console.log('Fetching player stats for college:', college);

    const players = await db.collection('player_stats').aggregate([
      { $lookup: { from: 'users', localField: 'player_id', foreignField: '_id', as: 'user' } },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      { $match: { 
          'user.isDeleted': { $ne: 1 }
        } 
      },
      { $project: { 
          name: { $ifNull: ['$user.name', 'Unknown Player'] },
          gamesPlayed: { $ifNull: ['$gamesPlayed', 0] },
          wins: { $ifNull: ['$wins', 0] },
          losses: { $ifNull: ['$losses', 0] },
          draws: { $ifNull: ['$draws', 0] },
          rating: { $ifNull: ['$rating', 0] }
        } 
      }
    ]).sort({ rating: -1 }).toArray();

    console.log('Fetched player stats count:', players.length);
    console.log('Sample player:', players[0]);

    res.json({ players });
  } catch (error) {
    console.error('Error fetching player stats:', error);
    res.status(500).json({ error: 'Failed to fetch player stats' });
  }
});

// Enrolled Players API
router.get('/api/enrolled-players', async (req, res) => {
  try {
    const tournamentId = req.query.tournament_id;
    if (!tournamentId) {
      return res.status(400).json({ error: 'Tournament ID is required' });
    }
    const db = await connectDB();
    const tid = new ObjectId(tournamentId);
    const tournament = await db.collection('tournaments').findOne({ _id: tid });
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }
    const individualPlayers = await db.collection('tournament_players').find({ tournament_id: tid }).toArray();
    const teamEnrollments = await db.collection('enrolledtournaments_team').aggregate([
      { $match: { tournament_id: tid } },
      { $lookup: { from: 'users', localField: 'captain_id', foreignField: '_id', as: 'captain' } },
      { $unwind: '$captain' },
      { $project: { player1_name: 1, player2_name: 1, player3_name: 1, player1_approved: 1, player2_approved: 1, player3_approved: 1, captain_name: '$captain.name' } }
    ]).toArray();
    res.json({ 
      tournamentName: tournament.name, 
      tournamentType: tournament.type, 
      individualPlayers: individualPlayers || [], 
      teamEnrollments: teamEnrollments || [] 
    });
  } catch (error) {
    console.error('Error fetching enrolled players:', error);
    res.status(500).json({ error: 'Failed to fetch enrolled players' });
  }
});

// Pairings API
router.get('/api/pairings', async (req, res) => {
  try {
    const tournamentId = req.query.tournament_id;
    const totalRounds = parseInt(req.query.rounds) || 5;
    if (!tournamentId) {
      return res.status(400).json({ error: 'Tournament ID is required' });
    }
    const db = await connectDB();
    const tid = new ObjectId(tournamentId);
    const rows = await db.collection('tournament_players').find({ tournament_id: tid }).toArray();
    if (rows.length === 0) {
      return res.json({ roundNumber: totalRounds, allRounds: [] });
    }
    let storedPairings = await db.collection('tournament_pairings').findOne({ tournament_id: tid });
    let allRounds;
    if (!storedPairings) {
      let players = rows.map(row => new Player(row._id, row.username, row.college, row.gender));
      const generatedRounds = swissPairing(players, totalRounds);
      await db.collection('tournament_pairings').insertOne({
        tournament_id: tid,
        totalRounds: totalRounds,
        rounds: generatedRounds.map(round => ({
          round: round.round,
          pairings: round.pairings.map(pairing => ({
            player1: {
              id: pairing.player1.id,
              username: pairing.player1.username,
              score: pairing.player1.score
            },
            player2: {
              id: pairing.player2.id,
              username: pairing.player2.username,
              score: pairing.player2.score
            },
            result: pairing.result
          })),
          byePlayer: round.byePlayer ? {
            id: round.byePlayer.id,
            username: round.byePlayer.username,
            score: round.byePlayer.score
          } : null
        }))
      });
      allRounds = generatedRounds.map(round => ({
        round: round.round,
        pairings: round.pairings.map(p => ({
          player1: {
            id: p.player1.id.toString(),
            username: p.player1.username,
            score: p.player1.score
          },
          player2: {
            id: p.player2.id.toString(),
            username: p.player2.username,
            score: p.player2.score
          },
          result: p.result
        })),
        byePlayer: round.byePlayer ? {
          id: round.byePlayer.id.toString(),
          username: round.byePlayer.username,
          score: round.byePlayer.score
        } : null
      }));
    } else {
      allRounds = storedPairings.rounds.map(roundData => ({
        round: roundData.round,
        pairings: roundData.pairings.map(pairingData => ({
          player1: {
            id: pairingData.player1.id.toString(),
            username: pairingData.player1.username,
            score: pairingData.player1.score
          },
          player2: {
            id: pairingData.player2.id.toString(),
            username: pairingData.player2.username,
            score: pairingData.player2.score
          },
          result: pairingData.result
        })),
        byePlayer: roundData.byePlayer ? {
          id: roundData.byePlayer.id.toString(),
          username: roundData.byePlayer.username,
          score: roundData.byePlayer.score
        } : null
      }));
    }
    res.json({ roundNumber: totalRounds, allRounds });
  } catch (error) {
    console.error('Error fetching pairings:', error);
    res.status(500).json({ error: 'Failed to fetch pairings' });
  }
});

// Rankings API
router.get('/api/rankings', async (req, res) => {
  try {
    const tournamentId = req.query.tournament_id;
    if (!tournamentId) {
      return res.status(400).json({ error: 'Tournament ID is required' });
    }
    const db = await connectDB();
    const tid = new ObjectId(tournamentId);
    const rows = await db.collection('tournament_players').find({ tournament_id: tid }).toArray();
    if (rows.length === 0) {
      return res.json({ rankings: [], tournamentId });
    }
    let storedPairings = await db.collection('tournament_pairings').findOne({ tournament_id: tid });
    let rankings = [];
    if (!storedPairings) {
      const totalRounds = 5;
      let players = rows.map(row => new Player(row._id, row.username, row.college, row.gender));
      const allRounds = swissPairing(players, totalRounds);
      await db.collection('tournament_pairings').insertOne({
        tournament_id: tid,
        totalRounds: totalRounds,
        rounds: allRounds.map(round => ({
          round: round.round,
          pairings: round.pairings.map(pairing => ({
            player1: {
              id: pairing.player1.id,
              username: pairing.player1.username,
              score: pairing.player1.score
            },
            player2: {
              id: pairing.player2.id,
              username: pairing.player2.username,
              score: pairing.player2.score
            },
            result: pairing.result
          })),
          byePlayer: round.byePlayer ? {
            id: round.byePlayer.id,
            username: round.byePlayer.username,
            score: round.byePlayer.score
          } : null
        }))
      });
      rankings = players.sort((a, b) => b.score - a.score).map((p, index) => ({
        rank: index + 1,
        playerName: p.username,
        score: p.score
      }));
    } else {
      let playersMap = new Map();
      rows.forEach(row => {
        playersMap.set(row._id.toString(), {
          id: row._id.toString(),
          username: row.username,
          score: 0
        });
      });
      storedPairings.rounds.forEach(round => {
        round.pairings.forEach(pairing => {
          const player1 = playersMap.get(pairing.player1.id.toString());
          const player2 = playersMap.get(pairing.player2.id.toString());
          if (player1) player1.score = pairing.player1.score;
          if (player2) player2.score = pairing.player2.score;
        });
        if (round.byePlayer) {
          const byePlayer = playersMap.get(round.byePlayer.id.toString());
          if (byePlayer) byePlayer.score = round.byePlayer.score;
        }
      });
      rankings = Array.from(playersMap.values())
        .sort((a, b) => b.score - a.score)
        .map((p, index) => ({
          rank: index + 1,
          playerName: p.username,
          score: p.score
        }));
    }
    res.json({ rankings, tournamentId });
  } catch (error) {
    console.error('Error fetching rankings:', error);
    res.status(500).json({ error: 'Failed to fetch rankings' });
  }
});

// ==================== PAGE RENDERING ROUTES ====================

function sendCoordinatorPage(res, filename) {
  const filePath = path.join(__dirname, 'views', 'coordinator', `${filename}.html`);

  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('Error sending HTML file:', filePath, err);
      res.status(err.status || 500).send('Error loading page');
    }
  });
}

router.get('/:subpage?', async (req, res) => {
  const subpage = req.params.subpage || 'coordinator_dashboard';

  if (!req.session.userEmail || req.session.userRole !== 'coordinator') {
    return res.redirect("/?error-message=Please log in as a coordinator");
  }

  try {
    switch (subpage) {
      case 'coordinator_dashboard':
        sendCoordinatorPage(res, 'coordinator_dashboard');
        break;
      case 'tournament_management':
        sendCoordinatorPage(res, 'tournament_management');
        break;
      case 'store_management':
        sendCoordinatorPage(res, 'store_management');
        break;
      case 'coordinator_meetings':
        sendCoordinatorPage(res, 'coordinator_meetings');
        break;
      case 'player_stats':
        sendCoordinatorPage(res, 'player_stats');
        break;
      case 'enrolled_players':
        sendCoordinatorPage(res, 'enrolled_players');
        break;
      case 'pairings':
        sendCoordinatorPage(res, 'pairings');
        break;
      case 'rankings':
        sendCoordinatorPage(res, 'rankings');
        break;
      case 'coordinator_profile':
        sendCoordinatorPage(res, 'coordinator_profile');
        break;
      default:
        return res.redirect('/coordinator/coordinator_dashboard?error-message=Page not found');
    }
  } catch (error) {
    console.error('Error loading coordinator page:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;