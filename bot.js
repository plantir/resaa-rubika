let Rubikabot = require('rubika-bot');
const token = process.env.token;
const User = require('./Model/User');
// Create a bot that uses 'polling' to fetch new updates
class Bot extends Rubikabot {
  // async sendMessage(chatId, text, body = {}, whith_history = true) {
  //   if (whith_history) {
  //     let user = new User(chatId);
  //     await user.push_history({
  //       text,
  //       body
  //     });
  //   }
  //   return super.sendMessage(chatId, text, body);
  // }
}
const bot = new Bot(token, {
  api_version: 1,
  polling: process.env.MODE == 'polling' ? true : false,
  start_message_id: 5870030129
});
module.exports = bot;
