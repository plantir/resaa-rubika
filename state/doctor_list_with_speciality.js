const User = require('../Model/User');
const Doctor = require('../Model/Doctor');
const bot = require('../bot');
const _enum = require('../config/enum');
const _ = require('lodash')
bot.on('message', async msg => {
    let user = new User(msg.chat_id)
    let state = await user.state;
    if (state != _enum.state.medical_question) {
        return
    }
    user.state = _enum.state.select_doctor;
    let specialities = await Doctor.get_speciality_list();
    let specialty_name = msg.text;
    let specialtyId;
    for (const item of specialities) {
        if (item.title == specialty_name) {
            specialtyId = item.id
            break;
        }
    }
    if (!specialtyId) {
        return
    }
  let doctors = await Doctor.get_doctors({
    specialtyId
  })
  // doctors = _.orderBy(doctors, 'currentlyAvailable', 'desc')
    let message = `لیست پزشکان متخصص ${msg.text}`
    let rows = [];
    doctors.forEach((doctor, index) => {
        let text = `${doctor.subscriberNumber} ${doctor.firstName} ${doctor.lastName}`;
        let image_url = `https://webapi.resaa.net/Rubika/Doctors/${doctor.subscriberNumber}/Image/${doctor.currentlyAvailable?'Available':'Unavailable'}`;
        let type = 'TextImgBig'
        if (index % 2 === 0) {
            rows.push({
                buttons: [{
                    type: "Simple",
                    button_view: {
                        image_url,
                        text,
                        type
                    }
                }]
            })
        } else {
            let i = Math.ceil(index / 2) - 1;

            rows[i].buttons.push({
                type: "Simple",
                button_view: {
                    image_url,
                    text,
                    type
                }
            })
        }
    });

    rows.push({
        buttons: [{
            type: "Simple",
            button_view: {
                text: "بازگشت",
                type: "TextOnly"
            }
        }]
    })
    rows.push({
        buttons: [{
            type: "Simple",
            button_view: {
                text: "بازگشت به خانه",
                type: "TextOnly"
            }
        }]
    })
    let data = {
        bot_keypad: {
            rows
        }
    }
    bot.sendMessage(msg.chat_id, message, {
        data
    })
})