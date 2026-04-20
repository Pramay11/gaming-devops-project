const express = require('express');
const app = express();

app.get('/health', (req, res) => {
  res.send("Matchmaking Service Running");
});

app.get('/match', (req, res) => {
  res.json({
    matchId: Math.floor(Math.random() * 1000),
    players: ["player1", "player2"]
  });
});

app.listen(3002, () => console.log("Matchmaking Service running on 3002"));