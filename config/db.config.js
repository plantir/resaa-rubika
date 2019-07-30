const mysql = require('mysql');
const db_config = {
  // timezone: 'utc',
  host: process.env.NODE_ENV == 'development' ? '127.0.0.1' : '127.0.0.1',
  user: process.env.NODE_ENV == 'development' ? 'root' : 'armin',
  password: process.env.NODE_ENV == 'development' ? '' : 'Merlin110',
  database:
    process.env.NODE_ENV == 'development'
      ? 'ressa_rubika_db'
      : 'resaa_rubika_db'
};
const connection = mysql.createConnection(db_config);

connection.connect(function(err) {
  if (err) {
    console.log('error when connecting to db:', err);
  }
});

var Redis = require('redis');

const conf = {
  host: 'localhost',
  port: 6379,
  prefix: 'rubika_'
};

// const dump = new RedisDump(conf);

const redis = Redis.createClient(conf);

redis.on('err', err => {
  console.error(err);
});
module.exports = {
  redis,
  connection
  // dump: dump
};
