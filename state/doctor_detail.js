const bot = require('../bot');
const DoctorProvider = require('../provider/DoctorProvider');

bot.on('message', async msg => {
  try {
    if (!msg.aux_data || msg.aux_data.button_id != 'doctor_detail') {
      return;
    }
    let id = +msg.text.replace(/[^\d+]/g, '');
    DoctorProvider.sned_doctor_profile(msg, id);
  } catch (error) {
    console.log(error);
    msg.res.status(500).json(error);
  }
});
