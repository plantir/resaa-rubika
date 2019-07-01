const User = require('../Model/User');
const Doctor = require('../Model/Doctor');
const bot = require('../bot');
const _enum = require('../config/enum');
const _ = require('lodash');
bot.on('message', async msg => {
  try {
    if (
      !msg.aux_data ||
      !(
        msg.aux_data.button_id == 'doctor_list_by_speciality' ||
        msg.aux_data.button_id == 'general_practitioner'
      )
    ) {
      return;
    }
    let user = new User(msg.chat_id);
    user.state = _enum.state.select_doctor;
    console.time('proc1');
    let specialtyId;
    if (msg.aux_data.button_id == 'msg.aux_data.button_id') {
      specialtyId = 43;
    } else {
      let specialities = await Doctor.get_speciality_list();
      let specialty_name = msg.text;
      for (const item of specialities) {
        if (item.title == specialty_name) {
          specialtyId = item.id;
          break;
        }
      }
    }
    console.timeEnd('proc1');
    if (!specialtyId) {
      return;
    }
    console.time('proc2');
    let doctors = await Doctor.get_doctors({
      specialtyId
    });
    console.timeEnd('proc2');
    // doctors = _.orderBy(doctors, 'currentlyAvailable', 'desc')
    let message = `لیست پزشکان متخصص ${msg.text}`;
    let rows = [];
    console.time('proc3');

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
              id: 'doctor_detail',
              type: 'Simple',
              button_view: {
                image_url,
                text,
                type
              },
              reply_type: 'API'
            }
          ]
        });
      } else {
        let i = Math.ceil(index / 2) - 1;

        rows[i].buttons.push({
          id: 'doctor_detail',
          type: 'Simple',
          button_view: {
            image_url,
            text,
            type
          },
          reply_type: 'API'
        });
      }
    });
    console.timeEnd('proc3');
    rows.push({
      buttons: [
        {
          type: 'Simple',
          button_view: {
            text: 'بازگشت به صفحه تخصص ها',
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
    user.history = data;

    msg.res.json(data);
  } catch (error) {
    console.log(error);
    msg.res.status(500).json(error);
  }
});
