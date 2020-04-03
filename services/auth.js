const {nanoid} = require('nanoid');
const {randomBytes} = require('crypto');
const argon2 = require('argon2');
const User = require('../models/User');

module.exports = class Auth {
  constructor() {}

  async singUp(username, password) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!username || !password) {
          return reject({message: 'all fields must be filled!'});
        }

        const salt = randomBytes(32);
        const hashedPassword = await argon2.hash(password, {salt});
        const token = this._createToken();

        const user = await User.create({
          username,
          password: hashedPassword,
          token
        });

        resolve({
          _id: user._id,
          username: user.username,
          token: user.token
        })
      } catch (e) {
        reject(e)
      }
    })
  }

  async login(username, password) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!username || !password) {
          return reject({message: 'all fields must be filled!'})
        }
        const user = await User.findOne({username});
        if (!user) {
          return reject({message: 'Username or password not correct!'})
        } else {
          const correctPassword = await argon2.verify(user.password, password);
          if (!correctPassword) {
            return reject({message: 'Username or password not correct!'})
          }

          const token = this._createToken();
          await User.update({username}, {
            token: token
          });
          resolve({
            _id: user._id,
            username: user.username,
            token
          });
        }
      } catch (e) {
        reject(e)
      }
    })
  }

  async logout(token) {
    return new Promise(async (resolve, reject) => {
      try {
        const message = {message: 'Logout success'};

        if(!token) resolve(message);

        const user = await User.findOne({token});

        if(!user) resolve(message);

        user.token = this._createToken();
        await user.save();

        resolve(message);
      } catch (e) {
        reject(e)
      }
    })
  }

  _createToken() {
    return nanoid(12)
  }
};