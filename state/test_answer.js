const User = require('../Model/User');
const Doctor = require('../Model/Doctor');
const bot = require('../bot');
const _enum = require('../config/enum');
const _ = require('lodash')
const fs = require('fs')
const request = require('request-promise')
bot.onText(/ارسال جواب آزمایش/, async msg => {
    let message = ''
    let rows = []
    let user = new User(msg.chat_id);
    let visit_doctor = await user.visit_doctor
    let phone = await user.phone
    let test_answer = await Doctor.request_test_answer(visit_doctor, phone)
    if (test_answer.status === 'needMoney') {
        message = `اعتبار فعلی شما ${test_answer.user_charge} تومان میباشد و در خواست شما نیاز به ${test_answer.request_price} تومان شارژ دارد `
        rows.push({
            buttons: [{
                button_view: {
                    text: `شارژ اعتبار رسا`,
                    type: 'TextOnly'
                }
            }]
        })
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
        return bot.sendMessage(msg.chat_id, message, {
            data
        })
    }
    message = `هزینه جواب آزمایش ${test_answer.request_price} تومان می باشد و در صورت ارسال فایل از شارژ رسا شما کم میشود\nدر صورت تایید عکس آزمایش خود را بفرستید`
    user.state = _enum.state.test_answer
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
    return bot.sendMessage(msg.chat_id, message, {
        data
    })
})

bot.on('file', async msg => {
    let user = new User(msg.chat_id)
    let state = await user.state;
    if (state != _enum.state.test_answer) {
        return
    }
    request.get(msg.file_inline.file_url, {
            encoding: null
        })
        .pipe(fs.createWriteStream('test.png'))
    console.log(msg);
})