const User = require('../Model/User');
const Doctor = require('../Model/Doctor');
const bot = require('../bot');
const _enum = require('../config/enum');
bot.onText(_enum.regex_state.test_charge, async msg => {
  let message = 'جهت شارژ اعتبار خود یکی از مبالغ زیر را انتخاب نمایید';
  let rows = [];
  let amounts = [1000, 20000, 30000, 40000, 50000];
  for (let amount of amounts) {
    rows.push({
      buttons: [
        {
          id: 'charge',
          type: 'Simple',
          button_view: {
            text: `${amount} تومان`,
            type: 'TextOnly'
          },
          reply_type: 'API'
        }
      ]
    });
  }

  rows.push({
    buttons: [
      {
        type: 'Simple',
        button_view: {
          text: 'بازگشت به خانه',
          type: 'TextOnly'
        },
        reply_type: 'API'
      }
    ]
  });
  let data = {
    text_message: message,
    bot_keypad: {
      rows
    }
  };
  msg.res.json(data);
});
bot.onText(_enum.regex_state.charge, async msg => {
  let message = 'جهت شارژ اعتبار خود یکی از مبالغ زیر را انتخاب نمایید';
  let rows = [];
  let amounts = [15000, 20000, 30000, 40000, 50000];
  for (let amount of amounts) {
    rows.push({
      buttons: [
        {
          id: 'charge',
          type: 'Simple',
          button_view: {
            text: `${amount} تومان`,
            type: 'TextOnly'
          },
          reply_type: 'API'
        }
      ]
    });
  }

  rows.push({
    buttons: [
      {
        type: 'Simple',
        button_view: {
          text: 'بازگشت به خانه',
          type: 'TextOnly'
        },
        reply_type: 'API'
      }
    ]
  });
  let data = {
    text_message: message,
    bot_keypad: {
      rows
    }
  };
  msg.res.json(data);
  // bot.sendMessage(msg.chat_id, message, {
  //   data
  // });
});
bot.on('message', async msg => {
  try {
    if (!msg.aux_data || msg.aux_data.button_id != 'charge') {
      return;
    }
    let message = '';
    let rows = [];
    let charge_amount;
    let user = new User(msg.chat_id);
    let phone = await user.phone;
    if (!phone) {
      message = `شما هنوز در رسا ثبت نام نکرده اید جهت ثبت نام روی دکمه ثبت نام کلیک کنید`;
      rows.push({
        buttons: [
          {
            type: 'AskMyPhoneNumber',
            button_view: {
              text: `ثبت نام`,
              type: 'TextOnly'
            }
          }
        ]
      });
      rows.push({
        buttons: [
          {
            type: 'Simple',
            button_view: {
              text: `بازگشت به خانه`,
              type: 'TextOnly'
            },
            reply_type: 'API'
          }
        ]
      });

      return msg.res.json({
        text_message: message,
        bot_keypad: {
          rows
        }
      });
    }
    try {
      charge_amount = new RegExp(/([0-9]+) تومان/, 'g').exec(msg.text)[1];
    } catch (error) {}
    try {
      let button_payment_token = await user.payment_token(
        phone,
        msg.chat_id,
        charge_amount
      );
      message = ` شما درخواست شارژ به مبلغ ${charge_amount} تومان برای شماره موبایل ${phone} داده اید`;
      message += `\n در صورت تایید موارد فوق بر روی پرداخت کلیک نمایید `;

      rows.push({
        buttons: [
          {
            type: 'Payment',
            button_view: {
              text: 'پرداخت',
              type: 'TextOnly'
            },
            button_payment: {
              button_payment_token
            }
          }
        ]
      });
      rows.push({
        buttons: [
          {
            type: 'Simple',
            button_view: {
              text: 'بازگشت به خانه',
              type: 'TextOnly'
            },
            reply_type: 'API'
          }
        ]
      });
      let data = {
        bot_keypad: {
          rows
        }
      };
      await bot.sendMessage(msg.chat_id, message, {
        data
      });
      msg.res.json({});
    } catch (error) {
      rows.push({
        buttons: [
          {
            type: 'Simple',
            button_view: {
              text: 'بازگشت به خانه',
              type: 'TextOnly'
            },
            reply_type: 'API'
          }
        ]
      });
      msg.res.json({});
      return bot.sendMessage(msg.chat_id, 'خطایی رخ داده است', {
        bot_keypad: {
          rows
        }
      });
    }
  } catch (error) {
    console.log(error);
    msg.res.status(500).json(error);
  }
});
