const User = require('../Model/User');
const Doctor = require('../Model/Doctor');
const bot = require('../bot');
const _enum = require('../config/enum');
const _ = require('lodash')
bot.onText(/ارسال جواب آزمایش/, async msg => {
    let message = ''
    let rows = []
    let user = new User(msg.chat_id);
    let visit_doctor = await user.visit_doctor
    let phone = await user.phone
    let doctor = await user.last_visit_doctor
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
    } else if (test_answer.status === 'needTalk') {
        user.state = _enum.state.doctor_detail
        message = `برای ارسال جواب آزمایش نیاز به هماهنگی قبلی با پزشک هست.\nشما در ۲۴ ساعت اخیر با این پزشک مکالمه ای نداشته اید لطفا ابتدا با پزشک خود مکالمه کنید سپس جواب آزمایش را ارسال نمایید`
        rows.push({
            buttons: [{
                button_view: {
                    text: `تماس با دکتر ${doctor.firstName} ${doctor.lastName}`,
                    type: 'TextOnly'
                }
            }]
        })
        rows.push({
            buttons: [{
                button_view: {
                    text: `بازگشت`,
                    type: 'TextOnly'
                }
            }]
        })
        rows.push({
            buttons: [{
                button_view: {
                    text: `بازگشت به خانه`,
                    type: 'TextOnly'
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
    bot.sendMessage(msg.chat_id, message, {
        data
    })
})
bot.onText(/حذف تمامی فایل ها و ارسال مجدد/, async msg => {
    let user = new User(msg.chat_id)
    let state = await user.state;
    if (state != _enum.state.test_answer) {
        return
    }
    await user.remove_files()
    let message = `همه فایل های ارسال شده پاک شده لطفا فایل خود رو مجددا ارسال نمایید`
    let data = {
        bot_keypad: {
            rows: [{
                buttons: [{
                    type: "Simple",
                    button_view: {
                        text: "بازگشت به خانه",
                        type: "TextOnly"
                    }
                }]
            }]
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
    let files = await user.add_file(msg.file_inline.file_url)
    let message = `شما تا کنون ${files.length} فایل پیوست کرده اید اگر فایل دیگری هم دارید ارسال کنید در غیر اینصورت بر روی دکمه ارسال جواب آزمایش ضربه بزنید`
    let data = {
        bot_keypad: {
            rows: [{
                buttons: [{
                    type: "Simple",
                    button_view: {
                        text: "اتمام",
                        type: "TextOnly"
                    }
                }]
            }, {
                buttons: [{
                    type: "Simple",
                    button_view: {
                        text: "حذف تمامی فایل ها و ارسال مجدد",
                        type: "TextOnly"
                    }
                }]
            }, {
                buttons: [{
                    type: "Simple",
                    button_view: {
                        text: "بازگشت به خانه",
                        type: "TextOnly"
                    }
                }]
            }]
        }
    }
    return bot.sendMessage(msg.chat_id, message, {
        data
    })

})
bot.onText(/اتمام|تلاش مجدد/, async msg => {
    let user = new User(msg.chat_id);
    let doctor_id = await user.visit_doctor
    let res = await Doctor.find(doctor_id)
    let doctor = res.result.doctor;

    let message;
    let data;
    try {
        let tracking_code = await user.send_testAnswer(96852497)
        message = `جواب آزمایش شما با موفقیت برای دکتر ${doctor.firstName} ${doctor.lastName} ارسال شد\n کد پیگیری جواب آزمایش شما ${tracking_code}`
        data = {
            bot_keypad: {
                rows: [{
                    buttons: [{
                        type: "Simple",
                        button_view: {
                            text: "بازگشت به خانه",
                            type: "TextOnly"
                        }
                    }]
                }]
            }
        }
    } catch (error) {
        message = error;
        data = {
            bot_keypad: {
                rows: [{
                    buttons: [{
                        type: "Simple",
                        button_view: {
                            text: "تلاش مجدد",
                            type: "TextOnly"
                        }
                    }]
                }, {
                    buttons: [{
                        type: "Simple",
                        button_view: {
                            text: "بازگشت به خانه",
                            type: "TextOnly"
                        }
                    }]
                }]
            }
        }
    }

    bot.sendMessage(msg.chat_id, message, {
        data
    })
})