const User = require('../Model/User');
const Doctor = require('../Model/Doctor');
const bot = require('../bot');
const _enum = require('../config/enum');
bot.onText(/جستجو بر اساس نام پزشک|جستجوی نام پزشک دیگر/, async msg => {
  let user = new User(msg.chat_id);
  user.state = _enum.state.search_doctor_with_name;
  let message = `نام پزشک مورد نظر را نوشته و ارسال کنید.`;
  let rows = [];
  rows.push({
    buttons: [
      {
        type: 'Simple',
        button_view: {
          text: 'جستجو بر اساس کد پزشک',
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
  bot.sendMessage(msg.chat_id, message, {
    data
  });
});
bot.on('message', async msg => {
  let user = new User(msg.chat_id);
  let state = await user.state;
  if (state != _enum.state.search_doctor_with_name) {
    return;
  }
  user.state = _enum.state.select_doctor;
  let name = msg.text;
  octors = await Doctor.get_doctors({
    name
  });
  doctors = _.orderBy(doctors, 'currentlyAvailable', 'desc');
  let message = `نتایج جستجو برای پزشک ${name}`;
  let rows = [];
  doctors.forEach((doctor, index) => {
    let text = `${doctor.subscriberNumber} ${doctor.firstName} ${
      doctor.lastName
    }`;
    let image_url = `https://webapi.resaa.net/Rubika/Doctors/${
      doctor.subscriberNumber
    }/Image/${doctor.currentlyAvailable ? 'Available' : 'Unavailable'}`;
    let type = 'TextImgBig';
    if (index % 2 === 0) {
      rows.push({
        buttons: [
          {
            type: 'Simple',
            button_view: {
              text,
              image_url,
              type
            }
          }
        ]
      });
    } else {
      let i = Math.ceil(index / 2) - 1;

      rows[i].buttons.push({
        type: 'Simple',
        button_view: {
          text,
          image_url,
          type
        }
      });
    }
  });
  if (doctors.length === 0) {
    message = `نتیجه ای برای پزشک "${name}" یافت نشد\nشما میتوانید از طریق تماس با پشتیبانی پزشک خود را به رسا اضافه کنید`;
    rows.push({
      buttons: [
        {
          type: 'Call',
          button_view: {
            text: ' تماس با پشتیبانی برای اضافه شدن پزشک',
            type: 'TextOnly'
          },
          button_call: {
            phone_number: '02174471300'
          }
        }
      ]
    });
  }
  rows.push({
    buttons: [
      {
        type: 'Simple',
        button_view: {
          text: 'جستجوی نام پزشک دیگر',
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
  bot.sendMessage(msg.chat_id, message, {
    data
  });
});
