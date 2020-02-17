export default {
  host: process.env.APP_HOST,
  port: process.env.APP_PORT,
  wssPort: process.env.WSS_PORT,
  sslMode: process.env.SSL_MODE,
  sslKeyPath: process.env.SSL_KEY_PATH,
  sslCertPath: process.env.SSL_CERT_PATH,
  sslCaPath: process.env.SSL_CA_PATH,
};
