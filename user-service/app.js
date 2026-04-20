const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI);

const User = mongoose.model('User', {
  name: String,
  score: Number
});

app.post('/user', async (req, res) => {
  const user = new User(req.body);
  await user.save();
  res.send(user);
});

app.get('/users', async (req, res) => {
  const users = await User.find();
  res.send(users);
});

app.listen(3000, () => console.log('User service running'));
