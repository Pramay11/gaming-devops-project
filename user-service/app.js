const express = require('express');
const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.send("User Service Running");
});

app.post('/login', (req, res) => {
  const { username } = req.body;
  res.json({ message: `Welcome ${username}` });
});

app.listen(3000, () => console.log("User Service on 3000"));
