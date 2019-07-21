const Doctor = require('../Model/Doctor');
const bot = require('../bot');
const _enum = require('../config/enum');
bot.onText(_enum.regex_state.speciality, async msg => {
  try {
    let message = `به چه تخصصی نیاز دارید؟`;
    let rows = [];
    let specialities = await Doctor.get_speciality_list();
    specialities.forEach((item, index) => {
      let text = `${item.title}`;
      let image_url = `https://webapi.resaa.net/${item.iconPath}`;
      let type = 'TextImgBig';
      // if (index > 21) {
      //   return;
      // }
      if (index % 2 === 0) {
        rows.push({
          buttons: [
            {
              id: 'doctor_list_by_speciality',
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
      } else {
        let i = Math.ceil(index / 2) - 1;

        rows[i].buttons.push({
          id: 'doctor_list_by_speciality',
          type: 'Simple',
          button_view: {
            text,
            image_url,
            type
          },
          reply_type: 'API'
        });
      }
    });
    rows.push({
      buttons: [
        {
          id: 'general_practitioner',
          type: 'Simple',
          button_view: {
            text: 'نمیدانم چه تخصصی نیاز دارم',
            type: 'TextOnly'
          },
          reply_type: 'API'
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
      },
      text_message: message
    };
    msg.res.json(data);
  } catch (error) {
    console.error(error);
  }
});
