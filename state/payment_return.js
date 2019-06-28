const bot = require('../bot');
const User = require('../Model/User');
const Doctor = require('../Model/Doctor');
const _enum = require('../config/enum');
bot.onText(_enum.regex_state.payment_check, async msg => {
  try {
    await User.payment_verify(msg.aux_data.order_id);
    await bot.sendMessage(msg.chat_id, '✅ پرداخت با موفقیت انجام شد ✅');
    let user = new User(msg.chat_id);
    let phone = await user.phone;
    let state = await user.state;
    let visit_doctor = await user.visit_doctor;
    let doctor = await user.last_visit_doctor;
    let rows = [];
    if (state == _enum.state.test_answer) {
      let message = '';

      let test_answer = await Doctor.request_test_answer(visit_doctor, phone);
      message = `هزینه جواب آزمایش ${
        test_answer.request_price
      } تومان می باشد و در صورت ارسال فایل از شارژ رسا شما کم میشود\nدر صورت تایید عکس آزمایش خود را بفرستید`;
      rows.push({
        buttons: [
          {
            button_view: {
              text: `بازگشت به خانه`,
              type: 'TextOnly'
            }
          }
        ]
      });
      let data = {
        bot_keypad: {
          rows
        }
      };
      bot.sendMessage(msg.chat_id, message, {
        data
      });
    } else if ((state = _enum.state.call_doctor)) {
      let minute_array =
        doctor.specialty.id == 41 ? [5, 10, 15, 30] : [3, 5, 10];
      let price = await Doctor.get_time_price(visit_doctor, phone);
      let { costPerMinute, duration, isFreeFirstCall } = price.result.quote;
      if (isFreeFirstCall) {
        await user.book_doctor(doctor.subscriberNumber);
        bot.sendMessage(
          msg.chat_id,
          `شما تماس اول را مهمان رسا هستید\nشما میتوانید به مدت ${duration} دقیقه با دکتر 🕐 ${
            doctor.firstName
          } ${
            doctor.lastName
          } صحبت کنید\nبرای برقراری تماس بر روی دکمه تماس کلیک کنید و سپس کد ${
            doctor.subscriberNumber
          } را شماره گیری نمایید`,
          {
            data: {
              bot_keypad: {
                rows: [
                  {
                    buttons: [
                      {
                        type: 'Call',
                        button_view: {
                          text: 'تماس با پزشک',
                          type: 'TextOnly'
                        },
                        button_call: {
                          phone_number: '02174471111'
                        }
                      }
                    ]
                  }
                ]
              }
            }
          }
        );
      } else if (duration < 2) {
        let amount_list = calc_amount(costPerMinute, minute_array);
        message = `هزینه تماس با دکتر ${doctor.firstName} ${doctor.lastName}`;
        message += `\n\nدر صورتی که مدت زمان مکالمه کمتر از این مقدار باشد پول در حساب شما میماند و میتوانید در تماس های بعدی از آن استفاده نمایید`;
        message += `\n\nدر صورت عدم برقراری ارتباط میتوانید با پشتیبانی تماس گرفته و درخواست استرداد وجه نمایید `;
        for (let item of amount_list) {
          rows.push({
            buttons: [
              {
                id: 'charge',
                type: 'Simple',
                button_view: {
                  text: `${item.perioud} دقیقه ${item.amount} تومان`,
                  type: 'TextOnly'
                },
                reply_type: 'API'
              }
            ]
          });
        }

        rows.push({
          buttons: [
            {
              type: 'Simple',
              button_view: {
                text: 'بازگشت به خانه',
                type: 'TextOnly'
              },
              reply_type: 'API'
            }
          ]
        });
        let data = {
          bot_keypad: {
            rows
          }
        };
        bot.sendMessage(msg.chat_id, message, {
          data
        });
      } else {
        await user.book_doctor(doctor.subscriberNumber);
        rows.push({
          buttons: [
            {
              type: 'Call',
              button_view: {
                text: 'تماس با پزشک',
                type: 'TextOnly'
              },
              button_call: {
                phone_number: '02174471111'
              }
            }
          ]
        });
        rows.push({
          buttons: [
            {
              type: 'Simple',
              button_view: {
                text: 'بازگشت به خانه',
                type: 'TextOnly'
              },
              reply_type: 'API'
            }
          ]
        });
        let data = {
          bot_keypad: {
            rows
          }
        };
        bot.sendMessage(
          msg.chat_id,
          `شما میتوانید به مدت ${duration} دقیقه 🕐 با دکتر ${
            doctor.firstName
          } ${
            doctor.lastName
          } صحبت کنید\nبرای برقراری تماس بر روی دکمه تماس کلیک کنید و سپس کد ${
            doctor.subscriberNumber
          } را شماره گیری نمایید`,
          {
            data
          }
        );
      }
    }
  } catch (error) {
    console.log(error);
    msg.res.status(500).json(error);
    bot.sendMessage(msg.chat_id, '❌ پرداخت با مشکل مواجه شد ❌');
  }
});

function calc_amount(costPerMinute, minutes) {
  let amount_list = [];
  for (let min of minutes) {
    let amount = costPerMinute * min;
    if (amount < 10000) {
      amount = 10000;
    } else {
      amount = Math.ceil(amount / 5000) * 5000;
    }
    amount_list.push({
      perioud: min,
      amount
    });
  }
  return amount_list;
}
