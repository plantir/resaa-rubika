const User = require('../Model/User');
const Doctor = require('../Model/Doctor');
const bot = require('../bot');
const _enum = require('../config/enum');
const DoctorProvider = require('../provider/DoctorProvider')
const _ = require('lodash')
bot.onText(/\d+/, async msg => {
    let id = +msg.text.replace(/[^\d+]/g, '')
    let user = new User(msg.chat_id)
    let state = await user.state;
    if (state != _enum.state.select_doctor) {
        return
    }
    return DoctorProvider.sned_doctor_profile(msg.chat_id, id)
 
})