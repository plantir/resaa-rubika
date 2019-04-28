let Rubikabot = require('node-rubika-bot-api')
const token = 'DG0RIQVKTTKCUEUGURNGOHBLWULTSSQFHISIFXGXDACBMGZFWKDWNBLZKQLFSJDY'
const User = require('./Model/User')
// Create a bot that uses 'polling' to fetch new updates
class Bot extends Rubikabot {
  async sendMessage(chatId, text, body = {}, whith_history = true) {
    if (whith_history) {
      let user = new User(chatId)
      await user.push_history({
        text,
        body
      })
    }
    return super.sendMessage(chatId, text, body)
  }
}
const bot = new Bot(token, {
  polling: process.env.MODE == 'polling' ? true : false,
  start_message_id: 4452829206
})
module.exports = bot