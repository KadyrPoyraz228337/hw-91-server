const express = require('express');

const Auth = require('../services/auth');
const isAuth = require('../middlewares/isAuth');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const
      username = req.body.username,
      password = req.body.password;

    const service = new Auth();
    const user = await service.singUp(username, password);
    res.send(user);
  } catch (e) {
    req.status(404).send(e);
  }
});

router.post('/sessions', async (req, res) => {
  try {
    const
      username = req.body.username,
      password = req.body.password;

    const service = new Auth();
    const user = await service.login(username, password);
    res.send(user);
  } catch (e) {
    req.status(404).send(e);
  }
});

router.delete('/sessions', isAuth, async (req, res) => {
  try {
    const
      token = req.currentUser.token;

    const service = new Auth();
    const user = await service.logout(token);

    res.send(user);
  } catch (e) {
    req.status(404).send(e);
  }
});

module.exports = router;