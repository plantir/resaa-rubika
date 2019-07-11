const bot = require('../bot');
const User = require('../Model/User');
const _enum = require('../config/enum');
bot.onText(_enum.regex_state.my_doctor, async msg => {
  let user = new User(msg.chat_id);
  let doctor = await user.last_visit_doctor;
  let rows = [];
  if (doctor) {
    let text = `${doctor.subscriberNumber} ${doctor.firstName} ${
      doctor.lastName
    }`;
    let image_url = `https://webapi.resaa.net/Rubika/Doctors/${
      doctor.subscriberNumber
    }/Image/${doctor.currentlyAvailable ? 'Available' : 'Unavailable'}`;
    let type = 'TextImgBig';
    rows.push({
      buttons: [
        {
          id: 'doctor_detail',
          type: 'Simple',
          button_view: {
            text,
            image_url,
            type
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
            id: 'search_doctor',
            type: 'Textbox',
            button_view: {
              text: 'جستجو بر اساس کد یا نام پزشک',
              type: 'TextOnly'
            },
            button_textbox: {
              type_keypad: 'String'
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
              text: 'بازگشت به خانه',
              type: 'TextOnly'
            },
            reply_type: 'API'
          }
        ]
      }
    ]
  );
  let data = {
    bot_keypad: {
      rows
    }
  };

  msg.res.json(data);
});
