export default {
  type: 'mysql',
  host: process.env.TYPEORM_HOST,
  // tslint:disable-next-line: radix
  port: parseInt(process.env.TYPEORM_PORT),
  username: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  database: 'chat',
  logging: process.env.TYPEORM_LOGGING === 'true',
  entities: ['*/**/*.entity{.ts,.js}'],
  migrationsRun: process.env.TYPEORM_MIGRATIONS_RUN === 'true',
  synchronize: true,
};
