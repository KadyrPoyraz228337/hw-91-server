const express = require('express');
const expressWs = require('express-ws');
const {nanoid} = require('nanoid');

const Messages = require('../services/messages');

const router = express.Router();

expressWs(router);


const connections = {};

router.ws('/', (ws, req) => {
  const id = nanoid();

  ws.on('message', async msg => {
    msg = JSON.parse(msg) || msg;

    if (msg.type === 'CONNECT_USER') {
      connections[id] = ws;
      connections[id].data = msg.user;

      Object.keys(connections).forEach(conn => {
        const data = Object.keys(connections).map(user => connections[user].data);
        connections[conn].send(JSON.stringify({type: 'USERS_ONLINE', data}));
      });

    } else if (msg.type === 'GET_MESSAGES') {
      const service = new Messages();
      const messages = await service.getMessages(
        connections[id].data._id
      );

      Object.keys(connections).forEach(conn => {
        connections[conn].send(JSON.stringify({type: 'GET_MESSAGES', messages}));
      });

    } else if (msg.type === 'SEND_MESSAGE') {
      const text = msg.data.text;
      const recipient = msg.data.recipient;
      const user = connections[id].data._id;

      const service = new Messages();
      const message = await service.addMessage(text, user, recipient);

      Object.keys(connections).forEach(conn => {
        if(message.recipient) {
          console.log('rec', message.recipient);
          console.log('user', connections[conn].data);
          console.log('author', connections[id].data);
          if(connections[conn].data._id === message.recipient || connections[id].data._id === connections[conn].data._id) {
            connections[conn].send(JSON.stringify({type: 'SEND_MESSAGE', message: {...message._doc, user: {username: connections[id].data.username, _id: connections[id].data._id}}}));
          }
        } else {
          connections[conn].send(JSON.stringify({type: 'SEND_MESSAGE', message: {...message._doc, user: {username: connections[id].data.username, _id: connections[id].data._id}}}));
        }
      });
    }
  });

  ws.on('close', msg => {
    delete connections[id];

    Object.keys(connections).forEach(conn => {
      const data = Object.keys(connections).map(user => connections[user].data);
      connections[conn].send(JSON.stringify({type: 'USERS_ONLINE', data}));
    });

  })
});

module.exports = router;