const Message = require('../models/Message');

module.exports = class Messages {
  constructor() {}

  async addMessage(text, user, recipient) {
    return new Promise(async (resolve, reject) => {
      try {
        recipient = recipient ? recipient : null;

        const message = await Message.create({
          text: text,
          user: user,
          recipient: recipient
        });

        resolve(message)
      } catch (e) {
        reject(e)
      }
    })
  };

  async getMessages(user) {
    return new Promise(async (resolve, reject) => {
      try {
        const messages = await Message.find({
          $or: [
            {recipient: null},
            {recipient: user}
          ]
        }).sort({_id: -1}).limit(30).populate('user', ['username']);

        resolve(messages)
      } catch (e) {
        reject(e)
      }
    })
  };
};