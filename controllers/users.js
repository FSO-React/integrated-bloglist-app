const bcrypt = require('bcrypt');
const usersRouter = require('express').Router();
const User = require('../models/user');

usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs', { url: 1, title: 1, author: 1, id: 1 });
  response.json(users);
});

usersRouter.get('/:id', async (request, response) => {
  const user = await User.findById(request.params.id).populate('blogs', { url: 1, title: 1, author: 1, id: 1 });
  if (user) {
    response.json(user);
  } else {
    response.status(404).end();
  }
});

usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body;

  if (!username || username.trim().length < 3) {
    return response.status(400).json({ error: 'username must be at least 3 characters long' });
  }

  if (!password || password.trim().length < 3) {
    return response.status(400).json({ error: 'password must be at least 3 characters long' });
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    username,
    name,
    passwordHash,
  });

  const savedUser = await user.save();
  response.status(201).json(savedUser);
});

module.exports = usersRouter;