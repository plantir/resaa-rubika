const User = require('../Model/User')
const Doctor = require('../Model/Doctor')
const bot = require('../bot')
const _enum = require('../config/enum')
const _ = require('lodash')
bot.onText(/تماس با دکتر *.*/, async msg => {
  let user = new User(msg.chat_id)
  let state = await user.state
  let message = ''
  let rows = []
  if (state != _enum.state.doctor_detail) {
    return
  }
  let phone = await user.phone
  if (!phone) {
    message = `شما هنوز در رسا ثبت نام نکرده اید حهت ثبت نام روی دکمه ثبت نام کلیک کنید`
    rows.push({
      buttons: [{
        type: 'AskMyPhoneNumber',
        button_view: {
          text: `ثبت نام`,
          type: 'TextOnly'
        }
      }]
    })
    rows.push({
      buttons: [{
        type: 'Simple',
        button_view: {
          text: 'بازگشت به خانه',
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

  let visit_doctor = await user.visit_doctor
  let res = await Doctor.find(visit_doctor)
  let doctor = res.result.doctor
  let minute_array = doctor.specialty.id == 41 ? [5, 10, 15, 30] : [3, 5, 10]
  let price = await Doctor.get_time_price(visit_doctor, phone)
  // let duration = price.result.quote.duration;
  // let costPerMinute = price.result.quote.costPerMinute
  let {
    costPerMinute,
    duration,
    isFreeFirstCall
  } = price.result.quote
  if (isFreeFirstCall) {
    return bot.sendMessage(msg.chat_id, `شما تماس اول را مهمان رسا هستید\nشما میتوانید به مدت ${duration} دقیقه با دکتر ${doctor.firstName} ${doctor.lastName} صحبت کنید\nبرای برقراری تماس بر روی دکمه تماس کلیک کنید و سپس کد ${doctor.subscriberNumber} را شماره گیری نمایید`, {
      data: {
        bot_keypad: {
          rows: [{
            buttons: [{
              type: "Call",
              button_view: {
                text: "تماس با پزشک",
                type: "TextOnly"
              },
              button_call: {
                "phone_number": "02174471111"
              },
            }]
          }]
        }
      }
    })

  }
  let amount_list = calc_amount(costPerMinute, minute_array)
  message = `هزینه تماس با دکتر ${doctor.firstName} ${doctor.lastName}`
  message += `\n\nدر صورتی که مدت زمان مکالمه کمتر از این مقدار باشد پول در حساب شما میماند و میتوانید در تماس های بعدی از آن استفاده نمایید`
  message += `\n\nدر صورت عدم برقراری ارتباط میتوانید با پشتیبانی تماس گرفته و درخواست استرداد وجه نمایید `
  for (let item of amount_list) {
    rows.push({
      buttons: [{
        type: 'Simple',
        button_view: {
          text: `${item.perioud} دقیقه ${item.amount} تومان`,
          type: 'TextOnly'
        }
      }]
    })
  }

  rows.push({
    buttons: [{
      type: 'Simple',
      button_view: {
        text: 'بازگشت به خانه',
        type: 'TextOnly'
      }
    }]
  })
  if (duration < 2) {
    message = `هزینه تماس با دکتر ${doctor.firstName} ${doctor.lastName}`
    message += `\n\nدر صورتی که مدت زمان مکالمه کمتر از این مقدار باشد پول در حساب شما میماند و میتوانید در تماس های بعدی از آن استفاده نمایید`
    message += `\n\nدر صورت عدم برقراری ارتباط میتوانید با پشتیبانی تماس گرفته و درخواست استرداد وجه نمایید `
    let data = {
      bot_keypad: {
        rows
      }
    }
    bot.sendMessage(msg.chat_id, message, {
      data
    })
  } else {
    rows.unshift({

      buttons: [{
        type: "Call",
        button_view: {
          text: "تماس با پزشک",
          type: "TextOnly"
        },
        button_call: {
          "phone_number": "02174471111"
        },
      }]

    })
    let data = {
      bot_keypad: {
        rows
      }
    }
    bot.sendMessage(msg.chat_id, `شما میتوانید به مدت ${duration} دقیقه با دکتر ${doctor.firstName} ${doctor.lastName} صحبت کنید\nبرای برقراری تماس بر روی دکمه تماس کلیک کنید و سپس کد ${doctor.subscriberNumber} را شماره گیری نمایید`, {
      data
    })
  }
})

function calc_amount(costPerMinute, minutes) {
  let amount_list = []
  for (let min of minutes) {
    let amount = costPerMinute * min
    if (amount < 10000) {
      amount = 10000
    } else {
      amount = Math.ceil(amount / 5000) * 5000
    }
    amount_list.push({
      perioud: min,
      amount
    })
  }
  return amount_list
}