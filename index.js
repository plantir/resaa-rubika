require('dotenv').config({
  path: process.env.NODE_ENV == 'development' ? './.env.development' : './.env'
});
require('./state/start');
require('./state/my_doctor');
require('./state/medical_question');
require('./state/search_doctor');
// require('./state/search_doctor_with_name');
// require('./state/search_doctor_with_code');
require('./state/doctor_list_with_speciality');
require('./state/doctor_detail');
require('./state/call_doctor');
require('./state/register');
require('./state/charge');
require('./state/back');
require('./state/payment_return');
require('./state/test_answer');
require('./state/404');
const { redis } = require('./config/db.config');
if (process.env.MODE !== 'polling') {
  const bot = require('./bot');
  const port = process.env.NODE_ENV == 'development' ? 8080 : 80;
  // const token = bot.token;
  // const url = 'https://rubika.resaa.net';
  const express = require('express');
  const bodyParser = require('body-parser');
  // bot.updateBotEndpoints(url);
  const User = require('./Model/User');
  const app = express();
  app.use(bodyParser.json());
  function modifyResponseBody(req, res, next) {
    var oldSend = res.send;
    res.send = function(data) {
      oldSend.apply(res, arguments);
      if (
        data == {} ||
        data == '{}' ||
        !req.body.message ||
        (req.body.message.aux_data &&
          req.body.message.aux_data.button_id == 'back')
      ) {
        return;
      }
      let user = new User(req.body.message.chat_id);
      user.push_history(data);
      user.log_history(req.body.message.text);
    };
    next();
  }

  app.use(modifyResponseBody);
  app.get('/report', (req, res) => {
    redis.smembers('members', async (err, data) => {
      let user_count = data.length;
      let register_count = 0;
      for (let chat_id of data) {
        let user = new User(chat_id);
        let phone = await user.phone;
        if (phone) {
          register_count++;
        }
      }
      res.send({ user_count, register_count });
    });
  });
  app.get('/addAllUser', (req, res) => {
    redis.keys(res.query.regex || 'rubika_b_*', (err, data) => {
      res.send(data);
      for (const item of data) {
        let chat_id = /rubika_(b_[0-9]+_[0-9]+)/.exec(item);
        if (chat_id && chat_id[1]) {
          redis.sadd('members', chat_id[1]);
        }
      }
    });
  });
  app.post(`/`, (req, res) => {
    if (!req.body.message) {
      return res.status(500).send('message not found');
    }
    let input = { ...req.body.message, res: res, reply_type: req.body.type };
    bot.processUpdate(input);
  });
  app.get(`/`, (req, res) => {
    res.status(200).send('worked');
  });

  // Start Express Server
  app.listen(port, () => {
    console.log(`Express server is listening on ${port}`);
  });
}
