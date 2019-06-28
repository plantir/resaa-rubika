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
if (process.env.MODE !== 'polling') {
  const bot = require('./bot');
  const port = 8080;
  const token = bot.token;
  // const url = 'https://rubika.resaa.net';
  const express = require('express');
  const bodyParser = require('body-parser');
  // bot.updateBotEndpoints(url);
  const app = express();
  app.use(bodyParser.json());
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
