const User = require('../Model/User');
const Doctor = require('../Model/Doctor');
const bot = require('../bot');
const _enum = require('../config/enum');
const _ = require('lodash');
bot.onText(_enum.regex_state.test_answer, async msg => {
  let message = '';
  let rows = [];
  let user = new User(msg.chat_id);
  let phone = await user.phone;
  phone = phone || '09356659943';
  let doctor_id = +msg.aux_data.button_id.replace(/[^\d+]/g, '');
  let test_answer = await Doctor.request_test_answer(doctor_id, phone);
  if (test_answer.status === 'ServiceUnavailable') {
    user.state = _enum.state.doctor_detail;
    message = `پزشک مورد این سرویس را تا اطلاع ثانوی غیر فعال کرده است`;
    rows.push({
      buttons: [
        {
          button_view: {
            text: `بازگشت`,
            type: 'TextOnly'
          }
        }
      ]
    });
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
    return bot.sendMessage(msg.chat_id, message, {
      data
    });
  } else if (test_answer.status === 'needMoney') {
    message = `اعتبار فعلی شما ${test_answer.user_charge} تومان میباشد و در خواست شما نیاز به ${test_answer.request_price} تومان شارژ دارد `;
    rows.push({
      buttons: [
        {
          button_view: {
            text: `شارژ اعتبار رسا`,
            type: 'TextOnly'
          }
        }
      ]
    });
    rows.push({
      buttons: [
        {
          type: 'Simple',
          button_view: {
            text: 'بازگشت',
            type: 'TextOnly'
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
          }
        }
      ]
    });
    let data = {
      bot_keypad: {
        rows
      }
    };
    return bot.sendMessage(msg.chat_id, message, {
      data
    });
  } else if (test_answer.status === 'needTalk') {
    let doctor = await user.last_visit_doctor;
    user.state = _enum.state.doctor_detail;
    message = `برای ارسال جواب آزمایش نیاز به هماهنگی قبلی با پزشک هست.\nشما در ۲۴ ساعت اخیر با این پزشک مکالمه ای نداشته اید لطفا ابتدا با پزشک خود مکالمه کنید سپس جواب آزمایش را ارسال نمایید`;
    rows.push({
      buttons: [
        {
          button_view: {
            text: `تماس با دکتر ${doctor.firstName} ${doctor.lastName}`,
            type: 'TextOnly'
          }
        }
      ]
    });
    rows.push({
      buttons: [
        {
          button_view: {
            text: `بازگشت`,
            type: 'TextOnly'
          }
        }
      ]
    });
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
    return bot.sendMessage(msg.chat_id, message, {
      data
    });
  }
  message = `هزینه جواب آزمایش ${test_answer.request_price} تومان می باشد و در صورت ارسال فایل از شارژ رسا شما کم میشود\nدر صورت تایید عکس آزمایش خود را بفرستید`;
  user.state = _enum.state.test_answer;
  rows.push({
    buttons: [
      {
        type: 'Simple',
        button_view: {
          text: 'بازگشت',
          type: 'TextOnly'
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
        }
      }
    ]
  });
  let data = {
    bot_keypad: {
      rows
    }
  };
  msg.res.json(data);
  bot.sendMessage(msg.chat_id, message, {
    data
  });
});
bot.onText(_enum.regex_state.reset_file_upload, async msg => {
  let user = new User(msg.chat_id);
  let state = await user.state;
  if (state != _enum.state.test_answer) {
    return;
  }
  await user.remove_files();
  let message = `همه فایل های ارسال شده پاک شده لطفا فایل خود رو مجددا ارسال نمایید`;
  let data = {
    bot_keypad: {
      rows: [
        {
          buttons: [
            {
              type: 'Simple',
              button_view: {
                text: 'بازگشت به خانه',
                type: 'TextOnly'
              }
            }
          ]
        }
      ]
    }
  };
  msg.res.json(data);
  return bot.sendMessage(msg.chat_id, message, {
    data
  });
});
bot.on('file', async msg => {
  let user = new User(msg.chat_id);
  let state = await user.state;
  if (state != _enum.state.test_answer) {
    return;
  }
  let files = await user.add_file(msg.file_inline.file_url);
  let message = `شما تا کنون ${files.length} فایل پیوست کرده اید اگر فایل دیگری هم دارید ارسال کنید در غیر اینصورت بر روی دکمه اتمام کلیک کنید`;
  let data = {
    bot_keypad: {
      rows: [
        {
          buttons: [
            {
              type: 'Simple',
              button_view: {
                text: 'اتمام',
                type: 'TextOnly'
              },
              reply_type: 'API'
            }
          ]
        },
        {
          buttons: [
            {
              type: 'Simple',
              button_view: {
                text: 'حذف تمامی فایل ها و ارسال مجدد',
                type: 'TextOnly'
              },
              reply_type: 'API'
            }
          ]
        },
        {
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
        }
      ]
    }
  };
  return bot.sendMessage(msg.chat_id, message, {
    data
  });
});
bot.onText(_enum.regex_state.finish_file_upload, async msg => {
  let user = new User(msg.chat_id);
  let phone = await user.phone;
  let doctor_id = await user.visit_doctor;
  // phone = '09356659943';
  // doctor_id = 6843;
  let res = await Doctor.find(doctor_id);
  let doctor = res.result.doctor;
  let message;
  let data;
  try {
    let test_answer = await Doctor.request_test_answer(doctor_id, phone);
    let { tracking_code, count } = await user.send_testAnswer(
      test_answer.chat_id
    );
    message = `جواب آزمایش شما با موفقیت برای دکتر ${doctor.firstName} ${doctor.lastName} ارسال شد\n کد پیگیری جواب آزمایش شما ${tracking_code}`;
    data = {
      bot_keypad: {
        rows: [
          {
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
          }
        ]
      }
    };
    user.confirm_testAnswer(doctor_id, tracking_code, count);
  } catch (error) {
    message = error;
    data = {
      bot_keypad: {
        rows: [
          {
            buttons: [
              {
                type: 'Simple',
                button_view: {
                  text: 'تلاش مجدد',
                  type: 'TextOnly'
                },
                reply_type: 'API'
              }
            ]
          },
          {
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
          }
        ]
      }
    };
  }

  bot.sendMessage(msg.chat_id, message, {
    data
  });
});
