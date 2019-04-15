const User = require('../Model/User');
const Doctor = require('../Model/Doctor');
const bot = require('../bot')
const _enum = require('../config/enum')
bot.onText(/سوال پزشکی دارم|بازگشت به صفحه تخصص ها/, async msg => {
    try {
        let user = new User(msg.chat_id);
        user.state = _enum.state.medical_question;
        let message = `به چه تخصصی نیاز دارید؟`
        let rows = [];
        let specialities = await Doctor.get_speciality_list();
        specialities.forEach((item, index) => {
            let text = `${item.title}`
            let image_url = `https://webapi.resaa.net/${item.imagePath}`
            let type = 'TextImgBig'
            if (index > 11) {
                return;
            }
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
        try {

            let res = await bot.sendMessage(msg.chat_id, message, {
                data
            })
            console.log(res);
        } catch (error) {

        }
    } catch (error) {
        console.log(error);
    }

})