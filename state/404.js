const bot = require('../bot');
const _enum = require('../config/enum');
const User = require('../Model/User');
bot.on('message', async msg => {
  try {
    if (msg.aux_data) {
      return;
    }
    let is_exist = Object.values(_enum.regex_state).some(item => {
      return item.test(msg.text);
    });
    if (!is_exist) {
      let user = new User(msg.chat_id);
      let data = await user.pop_history();
      if (!data) {
        // user.reset_state_history();
        user.state = _enum.state.start;
        let phone = await user.phone;
        let rows = [];
        if (phone) {
          rows.push({
            buttons: [
              {
                type: 'Simple',
                button_view: {
                  text: 'شارژ اعتبار رسا',
                  type: 'TextOnly'
                },
                reply_type: 'API'
              }
            ]
          });
        }
        rows.push(
          ...[
            {
              buttons: [
                {
                  type: 'Simple',
                  button_view: {
                    text: 'پرسش از پزشک خودم',
                    type: 'TextOnly'
                  },
                  reply_type: 'API'
                }
              ]
            },
            {
              buttons: [
                {
                  type: 'Simple',
                  button_view: {
                    text: 'انتخاب پزشکان دیگر',
                    type: 'TextOnly'
                  },
                  reply_type: 'API'
                }
              ]
            }
          ]
        );
        rows.push({
          buttons: [
            {
              type: 'Call',
              button_view: {
                text: 'تماس با پشتیبانی',
                type: 'TextOnly'
              },
              button_call: {
                phone_number: '02174471300'
              }
            }
          ]
        });
        data = {
          bot_keypad: {
            rows
          }
        };
      }
      bot.sendMessage(msg.chat_id, 'دستور نامعتبر', { data });
    }
  } catch (error) {
    console.log(error);
    msg.res.status(500).json(error);
  }
});
