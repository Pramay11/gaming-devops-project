const express = require('express');
const app = express();

app.get('/health', (req, res) => {
  res.send("Game Service Running");
});

app.get('/game/start', (req, res) => {
  res.json({ status: "Game Started" });
});

app.get('/game/state', (req, res) => {
  res.json({ players: 2, status: "running" });
});

app.listen(3001, () => console.log("Game Service running on 3001"));
