const { connection } = require('../config/db.config');

class LogProvider {
  static log_bot_request({ chat_id, text, button_id }) {
    return new Promise((resolve, reject) => {
      let query = `INSERT INTO \`user_history\` (\`chat_id\`, \`text\`,\`button_id\`, \`created_at\`) VALUES (${connection.escape(
        chat_id
      )},${connection.escape(text)},${connection.escape(
        button_id
      )}, ${connection.escape(new Date())})`;
      connection.query(query, (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows.insertId);
      });
    });
  }

  static log_api_request({ url }) {
    return new Promise((resolve, reject) => {
      let query = `INSERT INTO \`request_log\` (\`url\`, \`request_at\`) VALUES (${connection.escape(
        url
      )}, ${connection.escape(new Date())})`;
      connection.query(query, (err, rows, item) => {
        if (err) {
          return reject(err);
        }
        resolve(rows.insertId);
      });
    });
  }
  static update_log_api_request({ id, status }) {
    return new Promise((resolve, reject) => {
      let query = `UPDATE \`request_log\` set \`status\` = ${connection.escape(
        status
      )} , \`response_at\` = ${connection.escape(
        new Date()
      )} where \`id\` = ${connection.escape(id)}`;
      connection.query(query, (err, rows, item) => {
        if (err) {
          return reject(err);
        }
        resolve(rows.insertId);
      });
    });
  }
}

module.exports = LogProvider;
