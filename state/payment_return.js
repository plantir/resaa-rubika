const bot = require('../bot')
const User = require('../Model/User')
bot.onText(/بررسی وضعیت پرداخت/, async msg => {
  try {
    await User.payment_verify(msg.aux_data.order_id)
    await bot.sendMessage(msg.chat_id, '✅ پرداخت با موفقیت انجام شد ✅')
    let user = new User(chat_id)
    let phone = await user.phone
    let state = await user.state;
    let visit_doctor = await user.visit_doctor
    let doctor = await user.last_visit_doctor;
    let rows = []
    if (state == _enum.state.test_answer) {
      let message = ''

      let test_answer = await Doctor.request_test_answer(visit_doctor, phone)
      message = `هزینه جواب آزمایش ${test_answer.request_price} تومان می باشد و در صورت ارسال فایل از شارژ رسا شما کم میشود\nدر صورت تایید عکس آزمایش خود را بفرستید`
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
      bot.sendMessage(msg.chat_id, message, {
        data
      })
    } else if (state = _enum.state.call_doctor) {
      let price = await Doctor.get_time_price(visit_doctor, phone)
      let {
        duration,
      } = price.result.quote
      bot.sendMessage(msg.chat_id, `شما تماس اول را مهمان رسا هستید\nشما میتوانید به مدت ${duration} دقیقه 🕐 با دکتر ${doctor.firstName} ${doctor.lastName} صحبت کنید\nبرای برقراری تماس بر روی دکمه تماس کلیک کنید و سپس کد ${doctor.subscriberNumber} را شماره گیری نمایید`, {
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
      // await bot.sendMessage(msg.chat_id, `شما میتوانید به مدت ${duration} دقیقه 🕐 با دکتر  ${doctor.firstName} ${doctor.lastName} صحبت کنید\nبرای برقراری تماس ابتدا با شماره 02174471111 ☎️ تماس گرفته و سپس کد ${doctor.subscriberNumber} را شماره گیری نمایید`)
    }
  } catch (error) {
    bot.sendMessage(msg.chat_id, '❌ پرداخت با مشکل مواجه شد ❌')
  }
})