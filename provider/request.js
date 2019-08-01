const rp = require('request-promise');
const Log = require('./log');
module.exports = async function(options) {
  let log_id;
  try {
    if (process.env.API_LOG_HISTORY) {
      log_id = await Log.log_api_request({ url: options.uri });
    }
  } catch (error) {}
  return rp(options)
    .then(res => {
      if (log_id) {
        let status = 200;
        Log.update_log_api_request({ id: log_id, status });
      }
      return res;
    })
    .catch(err => {
      if (log_id) {
        let status = 500;
        Log.update_log_api_request({ id: log_id, status });
      }
      return err;
    });
};
