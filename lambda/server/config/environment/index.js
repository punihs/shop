const path = require('path');
const dotenv = require('dotenv');

const root = path.normalize(`${__dirname}/../../..`);

const env = dotenv.config({ path: path.join(root, '.env') }).parsed;

const config = {
  all: {
    env: env.NODE_ENV,
    port: env.PORT || 5004,
    ip: env.IP || '0.0.0.0',
    root,
    FROM_EMAIL: process.env.FROM_EMAIL || 'support@shoppre.com',
    URLS_API: `${env.PREFIX}api.${env.DOMAIN}`,
    URLS_PARCEL: `${env.PREFIX}parcel.${env.DOMAIN}`,
    URLS_WWW: `${env.PREFIX}www.${env.DOMAIN}`,
    PREFIX: `${env.PREFIX}`,
    DOMAIN: `${env.DOMAIN}`,
  },
  development: {

  },

  staging: {

  },

  production: {

  },
};

const conf = Object.assign(env, config.all, config[process.env.NODE_ENV || 'development']);

module.exports = conf;
