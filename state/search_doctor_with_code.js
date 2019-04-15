const User = require('../Model/User');
const Doctor = require('../Model/Doctor');
const bot = require('../bot')
const _enum = require('../config/enum')
bot.onText(/جستجو بر اساس کد پزشک|جستجوی کد پزشک دیگر/, async msg => {
    let user = new User(msg.chat_id);
    user.state = _enum.state.search_doctor_with_code;
    let message = `کد رسای پزشک مورد نظر را نوشته و ارسال کنید.`
    let rows = [];
    rows.push({
        buttons: [{
            type: "Simple",
            button_view: {
                text: "جستجو بر اساس نام پزشک",
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
bot.onText(/\d+/, async msg => {
    let user = new User(msg.chat_id)
    let state = await user.state;
    if (state != _enum.state.search_doctor_with_code) {
        return
    }
    user.state = _enum.state.select_doctor;
    let code = +msg.text.replace(/[^\d+]/g, '')
    let {result:{doctors}} = await Doctor.get_doctors({
        code
    })
    doctors = _.orderBy(doctors,'currentlyAvailable','desc')
    let message = `نتایج جستجو برای کد پزشک ${code}`
    let rows = [];
    doctors.forEach((doctor, index) => {
        let text = `${doctor.subscriberNumber} ${doctor.firstName} ${doctor.lastName}`
        let image_url = `https://webapi.resaa.net/Rubika/Doctors/${doctor.subscriberNumber}/Image/${doctor.currentlyAvailable?'Available':'Unavailable'}`;
        let type = 'TextImgBig'
        if (index % 2 === 0) {
            rows.push({
                buttons: [{
                    type: "Simple",
                    button_view: {
                        text,
                        image_url,
                        type
                    }
                }]
            })
        } else {
            let i = Math.ceil(index / 2) - 1;

            rows[i].buttons.push({
                type: "Simple",
                button_view: {
                    text,
                    image_url,
                    type
                }
            })
        }
    });
    if (doctors.result.doctors.length === 0) {
        message = `نتیجه ای برای کد پزشک "${code}" یافت نشد`
    }
    rows.push({
        buttons: [{
            type: "Simple",
            button_view: {
                text: "جستجوی کد پزشک دیگر",
                type: "TextOnly"
            }
        }]
    })
    rows.push({
        buttons: [{
            type: "Simple",
            button_view: {
                text: "جستجو بر اساس نام پزشک",
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