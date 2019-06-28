// const User = require('../Model/User');
const Doctor = require('../Model/Doctor');
const bot = require('../bot');
const _ = require('lodash');
bot.on('message', async msg => {
  try {
    if (!msg.aux_data || msg.aux_data.button_id != 'search_doctor') {
      return;
    }
    let doctors;
    let is_code = /^\d+$/.test(msg.text);
    if (is_code) {
      doctors = await Doctor.get_doctors({
        code: msg.text
      });
    } else {
      doctors = await Doctor.get_doctors({
        name: msg.text
      });
    }
    doctors = _.orderBy(doctors, 'currentlyAvailable', 'desc');
    let message = `نتایج جستجو برای پزشک ${msg.text}`;
    let rows = [];
    doctors.forEach((doctor, index) => {
      let text = `${doctor.subscriberNumber} ${doctor.firstName} ${
        doctor.lastName
      }`;
      let image_url = `https://webapi.resaa.net/Rubika/Doctors/${
        doctor.subscriberNumber
      }/Image/${doctor.currentlyAvailable ? 'Available' : 'Unavailable'}`;
      let type = 'TextImgBig';
      if (index % 2 === 0) {
        rows.push({
          buttons: [
            {
              type: 'Simple',
              button_view: {
                text,
                image_url,
                type
              }
            }
          ]
        });
      } else {
        let i = Math.ceil(index / 2) - 1;

        rows[i].buttons.push({
          type: 'Simple',
          button_view: {
            text,
            image_url,
            type
          }
        });
      }
    });
    if (doctors.length === 0) {
      message = `نتیجه ای برای پزشک "${
        msg.text
      }" یافت نشد\nشما میتوانید از طریق تماس با پشتیبانی پزشک خود را به رسا اضافه کنید`;
      rows.push({
        buttons: [
          {
            type: 'Call',
            button_view: {
              text: ' تماس با پشتیبانی برای اضافه شدن پزشک',
              type: 'TextOnly'
            },
            button_call: {
              phone_number: '02174471300'
            }
          }
        ]
      });
    }
    rows.push({
      buttons: [
        {
          id: 'search_doctor',
          type: 'Textbox',
          button_view: {
            text: 'جستجو کد یا نام پزشک دیگر',
            type: 'TextOnly'
          },
          button_textbox: {
            type_keypad: 'String'
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
    console.log(error);
    msg.res.status(500).json(error);
  }
});
