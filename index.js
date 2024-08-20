const express = require('express');
const mongoose = require('mongoose');
const { Server, WebSocket } = require('ws');
const path = require('path');
const cors = require('cors');
require('dotenv').config();


const app = express();

app.use(cors());

app.use(express.json());

app.use(express.static(path.join(__dirname, './client/build')));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './client/build', 'index.html'));
});

const server = app.listen(8000, () => {
  console.log('Server is running on port 8000');
});

const PASSWORD = process.env.PASSWORD;

const wss = new Server({ server });

mongoose.connect(`mongodb+srv://itsmevishal360:${PASSWORD}@cluster0.4lqyt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`)
.then(() => {
    console.log('Connected to MongoDB');
}   
).catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});

const GameSchema = new mongoose.Schema({
  user1Grid: [String],
  user2Grid: [String],
  user1CutNumbers: [Number],
  user2CutNumbers: [Number],
  winner: String
});

const Game = mongoose.model('Game', GameSchema);


app.post('/start-game', async (req, res) => {
  const { user1Grid, user2Grid } = req.body;
  const game = new Game({
    user1Grid,
    user2Grid,
    user1CutNumbers: [],
    user2CutNumbers: []
  });
  await game.save();
  res.json({ message: 'Game started' });
});

app.post('/cut-number', async (req, res) => {
  const { number } = req.body;
  const game = await Game.findOne().sort({ _id: -1 });

  if (game.user1Grid.includes(number.toString())) {
    game.user1CutNumbers.push(number);
  }
  if (game.user2Grid.includes(number.toString())) {
    game.user2CutNumbers.push(number);
  }

  await game.save();
  checkWinner(game);
  broadcastGameUpdate(game);
  res.json({ message: 'Number cut' });
});

function checkWinner(game) {
    const winningCombos = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8], 
    ];
  
    let user1WinningCombo = null;
    let user2WinningCombo = null;
  
    for (let combo of winningCombos) {
      if (combo.every(index => game.user1CutNumbers.includes(parseInt(game.user1Grid[index])))) {
        user1WinningCombo = combo;
      }
      if (combo.every(index => game.user2CutNumbers.includes(parseInt(game.user2Grid[index])))) {
        user2WinningCombo = combo;
      }
    }
  
    if (user1WinningCombo && !user2WinningCombo) {
      game.winner = 'User 1';
      game.save();
      broadcastGameUpdate(game);
      return;
    }
  
    if (user2WinningCombo && !user1WinningCombo) {
      game.winner = 'User 2';
      game.save();
      broadcastGameUpdate(game);
      return;
    }
  
    if (user1WinningCombo && user2WinningCombo) {
      const user1FirstCut = Math.min(...user1WinningCombo.map(index => game.user1CutNumbers.indexOf(parseInt(game.user1Grid[index]))));
      const user2FirstCut = Math.min(...user2WinningCombo.map(index => game.user2CutNumbers.indexOf(parseInt(game.user2Grid[index]))));
  
      if (user1FirstCut < user2FirstCut) {
        game.winner = 'User 1';
      } else {
        game.winner = 'User 2';
      }
  
      game.save();
      broadcastGameUpdate(game);
    }
  }

function broadcastGameUpdate(game) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(game));
    }
  });
}

wss.on('connection', (ws) => {
  console.log('WebSocket connection established');

  ws.on('message', (message) => {
    console.log('Received message:', message);
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
});