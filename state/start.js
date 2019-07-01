const User = require('../Model/User');
const bot = require('../bot');
const _enum = require('../config/enum');
const start_video = '145259288';
bot.onText(_enum.regex_state.start, async msg => {
  try {
    let user = new User(msg.chat_id);
    user.reset_state_history();
    user.state = _enum.state.start;
    let phone = await user.phone;
    let message = `به رسا خوش آمدید.\nبرای اطلاعات بیشتر ویدیو را مشاهده بفرمایید.`;
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
                text: 'انتخاب پزشکان دیگر',
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
                text: 'پرسش از پزشک خودم',
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
    let data = {
      bot_keypad: {
        rows
      }
    };
    if (msg.reply_type == 'API') {
      return msg.res.json(data);
    }
    data.file_id = start_video;
    bot.sendMessage(msg.chat_id, message, {
      data
    });
    msg.res.json({});
  } catch (error) {
    console.log(error);
    msg.res.status(500).json(error);
  }
});
