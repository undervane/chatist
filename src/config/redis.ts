export default {
  name: 'chat',
  host: process.env.REDIS_HOST || 'redis',
  port: process.env.REDIS_PORT || 6379,
};
