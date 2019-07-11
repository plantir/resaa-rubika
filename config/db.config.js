// var RedisDump = require('node-redis-dump')
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
  redis: redis
  // dump: dump
};
