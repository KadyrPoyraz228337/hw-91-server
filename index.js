const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const expressWs = require('express-ws');

const config = require('./config');
const users = require('./routes/users');
const chat = require('./routes/chat');

const app = express();
expressWs(app);

app.use(express.json());
app.use(cors());

const run = async () => {
  await mongoose.connect('mongodb://localhost/chat',
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    });

  app.use('/users', users);
  app.use('/chat', chat);

  app.listen(config.port, () => {
    console.log(`HTTP server start on ${config.port} port!`);
  });
};

run().catch(e => {
  console.log(e);
});