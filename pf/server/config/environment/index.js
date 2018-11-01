const path = require('path');
const dotenv = require('dotenv');

const root = path.normalize(`${__dirname}/../../..`);

const env = dotenv.config({ path: path.join(root, '.env') }).parsed;
const IS_DEV = env.NODE_ENV === 'development';

const config = {
  all: {
    env: env.NODE_ENV,
    port: env.PORT || 5000,
    ip: env.IP || '0.0.0.0',
    LAMBDA_PORT: process.env.LAMBDA_PORT || 5004,
    root,
    FROM_EMAIL: process.env.FROM_EMAIL || 'support@shoppre.com',
    URLS_API: `${env.PREFIX}api.${env.DOMAIN}`,
    URLS_MEMBER: `${env.PREFIX}member.${env.DOMAIN}`,
    URLS_WWW: `${env.PREFIX}www.${env.DOMAIN}`,
    PREFIX: `${env.PREFIX}`,
    DOMAIN: `${env.DOMAIN}`,
    auth: {
      google: {
        scope: 'https://www.googleapis.com/auth/plus.me https://www.googleapis.com/auth/userinfo.email',
        redirect_uri: IS_DEV ? 'http://localhost:5001/sign-in' : `${env.PREFIX}accounts.${env.DOMAIN}/sign-in`,
        client_id: '569763436942-abu23ni3ethv0n64mscbdihm1518t0pd.apps.googleusercontent.com',
        client_secret: 'EX9E5-vBMf5z6mJwAywlCSMe',
      },
    },
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
