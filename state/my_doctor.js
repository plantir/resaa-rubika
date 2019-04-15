const bot = require('../bot');
const User = require('../Model/User');
bot.onText(/پرسش از پزشک خودم/, async msg => {
    let user = new User(msg.chat_id);
    let doctor = await user.last_visit_doctor;
    let message = `نام یا کد رسا پزشک خود را وارد کنید`
    // {
    //     buttons: [{
    //         type: "Simple",
    //         button_view: {
    //             text: "تاریخچه پزشکان من",
    //             type: "TextOnly"
    //         }
    //     }]
    // },
    let rows = []
    if (doctor) {
        let text = `${doctor.subscriberNumber} ${doctor.firstName} ${doctor.lastName}`;
        let image_url = `https://webapi.resaa.net/Rubika/Doctors/${doctor.subscriberNumber}/Image/${doctor.currentlyAvailable?'Available':'Unavailable'}`;
        let type = 'TextImgBig'
        rows.push({
            buttons: [{
                type: "Simple",
                button_view: {
                    text,
                    image_url,
                    type,
                }
            }]
        })
    }
    rows.push(...[{
            buttons: [{
                type: "Simple",
                button_view: {
                    text: "جستجو بر اساس کد پزشک",
                    type: "TextOnly"
                }
            }]
        },
        {
            buttons: [{
                type: "Simple",
                button_view: {
                    text: "جستجو بر اساس نام پزشک",
                    type: "TextOnly"
                }
            }]
        },
        {
            buttons: [{
                type: "Simple",
                button_view: {
                    text: "بازگشت به خانه",
                    type: "TextOnly"
                }
            }]
        }
    ]);
    let data = {
        bot_keypad: {
            rows
        }
    }
    bot.sendMessage(msg.chat_id, message, {
        data
    })
})