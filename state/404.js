const bot = require('../bot');
const _enum = require('../config/enum');
bot.on('message', async msg => {
  try {
    if (msg.aux_data) {
      return;
    }
    let is_exist = Object.values(_enum.regex_state).some(item => {
      return item.test(msg.text);
    });
    if (!is_exist) {
      msg.res.json({});
      bot.sendMessage(msg.chat_id, 'دستور نامعتبر');
    }
  } catch (error) {
    console.log(error);
    msg.res.status(500).json(error);
  }
});
