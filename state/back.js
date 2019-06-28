const User = require('../Model/User');
const bot = require('../bot');
bot.on('message', async msg => {
  try {
    if (!msg.aux_data || msg.aux_data.button_id != 'back') {
      return;
    }
    let user = new User(msg.chat_id);
    let last_state = await user.pop_history();

    if (last_state) {
      msg.res.json(last_state.body);
    } else {
      msg.res.json({});
    }
  } catch (error) {
    console.log(error);
    msg.res.status(500).json(error);
  }
});
