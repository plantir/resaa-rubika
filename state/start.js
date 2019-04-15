const User = require('../Model/User');
const bot = require('../bot')
const _enum = require('../config/enum')
const start_video = '145259288'
bot.onText(/شروع|بازگشت به خانه/, async (msg) => {
    let user = new User(msg.chat_id);
    user.reset_state_history()
    user.state = _enum.state.start;
    let phone = await user.phone;
    let message = `به رسا خوش آمدید`;
    let rows = []
    if (phone) {
        rows.push({
            buttons: [{
                type: "Simple",
                button_view: {
                    text: "شارژ اعتبار رسا",
                    type: "TextOnly"
                }

            }]
        })
    }
    rows.push(...[{
        buttons: [{
            type: "Simple",
            button_view: {
                text: "سوال پزشکی دارم",
                type: "TextOnly"
            }

        }]
    }, {
        buttons: [{
            type: "Simple",
            button_view: {
                text: "پرسش از پزشک خودم",
                type: "TextOnly"
            }
        }]
    }]);
    rows.push({
        buttons: [{
            type: "Call",
            button_view: {
                text: "تماس با پشتیبانی",
                type: "TextOnly"
            },
            button_call: {
                "phone_number": "02174471300"
            },
        }]
    })
    let data = {
        file_id: start_video,
        bot_keypad: {
            rows
        }
    }
    bot.sendMessage(msg.chat_id, message, {
        data
    })
});