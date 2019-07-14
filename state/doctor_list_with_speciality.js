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
    console.time('map_speciality_name_to_id');
    let specialtyId;
    let message;
    if (msg.aux_data.button_id == 'general_practitioner') {
      specialtyId = 43;
      message = `لیست پزشکان عمومی`;
    } else {
      message = `لیست پزشکان متخصص ${msg.text}`;
      let specialities = await Doctor.get_speciality_list();
      let specialty_name = msg.text;
      for (const item of specialities) {
        if (item.title == specialty_name) {
          specialtyId = item.id;
          break;
        }
      }
    }
    console.timeEnd('map_speciality_name_to_id');
    if (!specialtyId) {
      return;
    }
    let doctors = await Doctor.get_doctors({
      specialtyId
    });
    // doctors = _.orderBy(doctors, 'currentlyAvailable', 'desc')

    let rows = [];

    doctors.forEach((doctor, index) => {
      let text = `${doctor.lastName} ${doctor.firstName} `;
      let image_url = `https://webapi.resaa.net/Rubika/Doctors/${
        doctor.subscriberNumber
      }/Image/${doctor.currentlyAvailable ? 'Available' : 'Unavailable'}`;
      let type = 'TextImgBig';
      if (index % 2 === 0) {
        rows.push({
          buttons: [
            {
              id: `doctor_detail_${doctor.subscriberNumber}`,
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
          id: `doctor_detail_${doctor.subscriberNumber}`,
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

    msg.res.json(data);
  } catch (error) {
    console.log(error);
    msg.res.status(500).json(error);
  }
});
