const bot = require('../bot')
const User = require('../Model/User')
bot.onText(/بررسی وضعیت پرداخت/, async msg => {
  try {
    let status = await User.payment_verify(msg.aux_data.order_id)
    bot.sendMessage(msg.chat_id, JSON.stringify(status))
  } catch (error) {
    bot.sendMessage(msg.chat_id, JSON.stringify(error))
  }
})
