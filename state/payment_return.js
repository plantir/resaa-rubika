const bot = require('../bot')
const User = require('../Model/User')
bot.onText(/بررسی وضعیت پرداخت/, async msg => {
  try {
    await User.payment_verify(msg.aux_data.order_id)
    bot.sendMessage(msg.chat_id, '✅ پرداخت با موفقیت انجام شد ✅')
  } catch (error) {
    bot.sendMessage(msg.chat_id, '❌ پرداخت با مشکل مواجه شد ❌')
  }
})