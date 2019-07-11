const User = require('../Model/User');
const bot = require('../bot');
bot.on('message', async msg => {
  try {
    if (!msg.aux_data || msg.aux_data.button_id != 'back') {
      return;
    }
    let user = new User(msg.chat_id);
    await user.pop_history();
    let data = await user.pop_history();

    if (data) {
      msg.res.json(data);
    } else {
      msg.res.json({});
    }
  } catch (error) {
    console.log(error);
    msg.res.status(500).json(error);
  }
});
