const User = require('../Model/User');
const Doctor = require('../Model/Doctor');
const bot = require('../bot');
const _enum = require('../config/enum');
const _ = require('lodash')
bot.onText(/بازگشت/, async msg => {
    if (msg.text == 'بازگشت به خانه') {
        return
    }
    let user = new User(msg.chat_id)
    let last_state = await user.pop_history()
    user.state = last_state.state;
    if (last_state) {
        bot.sendMessage(msg.chat_id, last_state.text, last_state.body)
    }
})