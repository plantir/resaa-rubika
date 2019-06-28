const User = require('../Model/User');
const Doctor = require('../Model/Doctor');
const bot = require('../bot');
const _enum = require('../config/enum');
const _ = require('lodash');
const DoctorProvider = require('../provider/DoctorProvider');
bot.onText(_enum.regex_state.register, async msg => {
  let user = new User(msg.chat_id);
  let state = await user.state;
  let message = '';
  let rows = [];
  let phone = msg.text.replace('98', '0');

  try {
    await user.register(phone);
    message = `ثبت نام با موفقیت انجام شد`;
    await bot.sendMessage(msg.chat_id, message);
  } catch (error) {
    await bot.sendMessage(msg.chat_id, error);
  }
  let visit_doctor = await user.visit_doctor;
  if (!visit_doctor) {
    rows.push({
      buttons: [
        {
          type: 'Simple',
          button_view: {
            text: 'بازگشت به خانه',
            type: 'TextOnly'
          }
        }
      ]
    });
  }
  let data = {
    bot_keypad: {
      rows
    }
  };

  if (!visit_doctor) {
    return;
  }
  DoctorProvider.sned_doctor_profile(msg, visit_doctor);
});

function calc_amount(costPerMinute, minutes) {
  let amount_list = [];
  for (let min of minutes) {
    let amount = costPerMinute * min;
    if (amount < 10000) {
      amount = 10000;
    } else {
      amount = Math.ceil(amount / 5000) * 5000;
    }
    amount_list.push({
      perioud: min,
      amount
    });
  }
  return amount_list;
}
