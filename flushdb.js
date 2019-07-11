const dbConf = require('./config/db.config');
const redis = dbConf.redis;
redis.flushdb();
