const mysql = require('mysql');

const db_config = {
  // timezone: 'utc',
  host: '127.0.0.1',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
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
