const User = require('../Model/User');
const Doctor = require('../Model/Doctor');
const bot = require('../bot');
bot.onText(/شارژ اعتبار رسا/, async msg => {
    let message = 'جهت شارژ اعتبار خود یکی از مبالغ زیر را انتخاب نمایید'
    let rows = []
    let amounts = [1000, 2000, 3000];
    for (let amount of amounts) {
        rows.push({
            buttons: [{
                type: "Simple",
                button_view: {
                    text: `${amount} تومان`,
                    type: "TextOnly"
                },
            }]
        })
    }

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
bot.onText(/[0-9]+ تومان/, async msg => {
    let message = '';
    let rows = [];
    let charge_amount;
    let user = new User(msg.chat_id)
    let phone = await user.phone;
    if (!phone) {
        message = `شما هنوز در رسا ثبت نام نکرده اید حهت ثبت نام روی دکمه ثبت نام کلیک کنید`
        rows.push({
            buttons: [{
                type: "AskMyPhoneNumber",
                button_view: {
                    text: `ثبت نام`,
                    type: "TextOnly"
                }
            }]
        })
        return bot.sendMessage(msg.chat_id, message, {
            bot_keypad: {
                rows
            }
        })
    }
    try {
        charge_amount = new RegExp(/([0-9]+) تومان/, 'g').exec(msg.text)[1];
    } catch (error) {

    }
    try {
        let button_payment_token = await user.payment_token(phone, msg.chat_id, charge_amount);
        message = ` شما درخواست شارژ به مبلغ ${charge_amount} تومان برای شماره موبایل ${phone} داده اید`
        message += `\n در صورت تایید موارد فوق بر روی پرداخت فشار دهید `

        rows.push({
            buttons: [{
                type: "Payment",
                button_view: {
                    text: "پرداخت",
                    type: "TextOnly"
                },
                button_payment: {
                    button_payment_token
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
        await bot.sendMessage(msg.chat_id, message, {
            data
        })
    } catch (error) {
        rows.push({
            buttons: [{
                type: "Simple",
                button_view: {
                    text: "بازگشت به خانه",
                    type: "TextOnly"
                }
            }]
        })
        return bot.sendMessage(msg.chat_id, 'خطایی رخ داده است', {
            bot_keypad: {
                rows
            }
        })
    }


    // message = `شارژ با موفقیت انجام شد`
    // message += `\nمبلغ ${charge_amount} تومان`
    // message += `\nاعتبار کنونی ${+charge_amount+4000} تومان`
    // let visit_doctor = await user.visit_doctor;
    // if (visit_doctor) {
    //     rows.push({
    //         buttons: [{
    //             type: "Call",
    //             button_view: {
    //                 text: "تماس با پزشک",
    //                 type: "TextOnly"
    //             },
    //             button_call: {
    //                 "phone_number": "02174471111"
    //             },
    //         }]
    //     })
    // }
    // rows.push({
    //     buttons: [{
    //         type: "Simple",
    //         button_view: {
    //             text: "بازگشت به خانه",
    //             type: "TextOnly"
    //         }
    //     }]
    // })
    // let data = {
    //     bot_keypad: {
    //         rows
    //     }
    // }
    // await bot.sendMessage(msg.chat_id, message, {
    //     data
    // })
    // if (!visit_doctor) {
    //     return
    // }
    // let res = await Doctor.find(visit_doctor)
    // let doctor = res.result.doctor;
    // message = `هزینه تماس با دکتر ${doctor.firstName} ${doctor.lastName}`

    // data.bot_keypad.rows.push({
    //     buttons: [{
    //         type: "Simple",
    //         button_view: {
    //             text: "5 دقیقه 10000 تومان",
    //             type: "TextOnly"
    //         }
    //     }]
    // })
    // data.bot_keypad.rows.push({
    //     buttons: [{
    //         type: "Simple",
    //         button_view: {
    //             text: "10 دقیقه 20000 تومان",
    //             type: "TextOnly"
    //         }
    //     }]
    // })
    // data.bot_keypad.rows.push({
    //     buttons: [{
    //         type: "Simple",
    //         button_view: {
    //             text: "15 دقیقه 30000 تومان",
    //             type: "TextOnly"
    //         }
    //     }]
    // })
    // data.bot_keypad.rows.push({
    //     buttons: [{
    //         type: "Simple",
    //         button_view: {
    //             text: "بازگشت به خانه",
    //             type: "TextOnly"
    //         }
    //     }]
    // })

    // bot.sendMessage(msg.chat_id, message, {
    //     data
    // })

})