const bot = require('../bot');
const User = require('../Model/User');
const Doctor = require('../Model/Doctor');
const _enum = require('../config/enum');
const _ = require('lodash');
class DoctorProvder {
  static async sned_doctor_profile(msg, doctor_id) {
    try {
      let user = new User(msg.chat_id);
      user.state = _enum.state.doctor_detail;
      user.visit_doctor = doctor_id;
      let res = await Doctor.find(doctor_id);
      let doctor = res.result.doctor;
      let phone = await user.phone;

      let rows = [];
      if (!phone) {
        rows.push({
          buttons: [
            {
              type: 'AskMyPhoneNumber',
              button_view: {
                text: `ثبت نام / ورود`,
                type: 'TextOnly'
              }
            }
          ]
        });
      }
      if (phone && doctor.providesDiagnosticDocumentsService) {
        rows.push({
          buttons: [
            {
              type: 'Simple',
              button_view: {
                text: `ارسال جواب آزمایش`,
                type: 'TextOnly'
              }
            }
          ]
        });
      }
      if (phone && doctor.currentlyAvailable) {
        rows.push({
          buttons: [
            {
              type: 'Simple',
              button_view: {
                text: `تماس با دکتر ${doctor.firstName} ${doctor.lastName}`,
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
            id: 'back',
            type: 'Simple',
            button_view: {
              text: 'بازگشت',
              type: 'TextOnly'
            },
            reply_type: 'API'
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
      if (msg.reply_type == 'API') {
        msg.res.json(data);
      }
      let doctor_image_id = await Doctor.image_id(doctor_id);
      user.last_visit_doctor = doctor;
      let message = `دکتر ${doctor.firstName} ${doctor.lastName}`;
      message += `\nکد رسا ${doctor.subscriberNumber}`;
      message += `\n${doctor.expertise}`;
      message += `\nوضعیت ${
        doctor.currentlyAvailable ? 'در دسترس' : 'خارج از دسترس'
      }`;
      let time_message = `زمان های پاسخگویی\n`;
      console.time('proc1');
      doctor.timetable.segments = _.sortBy(
        doctor.timetable.segments,
        o => o.from
      );
      for (const item of doctor.timetable.segments) {
        let date = Math.floor(item.from / 60 / 24);
        let date_name;
        switch (date) {
          case 0:
            date_name = 'شنبه       ';
            break;
          case 1:
            date_name = 'یکشنبه    ';
            break;
          case 2:
            date_name = 'دوشنبه    ';
            break;
          case 3:
            date_name = 'سه‌شنبه   ';
            break;
          case 4:
            date_name = 'چهارشنبه  ';
            break;
          case 5:
            date_name = 'پنجشنبه   ';
            break;
          case 6:
            date_name = 'جمعه       ';
            break;
        }
        let start_time_hour = Math.floor((item.from / 60) % 24);
        let end_time_hour = Math.floor((item.to / 60) % 24);
        let start_time_minute = Math.round(((item.from / 60) % 1) * 60);
        let end_time_minute = Math.round(((item.to / 60) % 1) * 60);
        if (start_time_minute < 10) {
          start_time_minute = `0${start_time_minute}`;
        }
        if (end_time_minute < 10) {
          end_time_minute = `0${end_time_minute}`;
        }
        if (start_time_hour < 10) {
          start_time_hour = `0${start_time_hour}`;
        }
        if (end_time_hour < 10) {
          end_time_hour = `0${end_time_hour}`;
        }
        time_message += `\n${date_name} ${end_time_hour}:${end_time_minute} - ${start_time_hour}:${start_time_minute} `;
      }
      console.timeEnd('proc1');

      try {
        await bot.sendMessage(msg.chat_id, '', {
          data: {
            file_id: doctor_image_id
          }
        });
        await bot.sendMessage(msg.chat_id, message, {});
        bot.sendMessage(
          msg.chat_id,
          time_message,
          msg.reply_type == 'API' ? {} : { data }
        );
      } catch (error) {
        console.error(error);
      }
    } catch (error) {
      console.log(error);
      msg.res.status(500).json(error);
    }
  }
}
module.exports = DoctorProvder;
