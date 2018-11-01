const debug = require('debug');
const RateLimit = require('express-rate-limit');

const Notify = require('../components/notify');

const log = debug('s-config-rateLimit');

const {
  API_THROTTLE_LIMIT, ACCOUNT_THROTTLE_LIMIT, env,
} = require('../config/environment');

const blacklist = {
  api: [],
  auth: [],
};
const WINDOW = {
  api: 15,
  auth: 1,
};

const count = type => (type === 'api'
  ? API_THROTTLE_LIMIT
  : ACCOUNT_THROTTLE_LIMIT
);

function checkNotify(db, req, type = 'api') {
  log('checkNotify', { type });
  if (!blacklist[type].includes(req.ip)) {
    blacklist[type].push(req.ip);
    const token = (req.query.access_token
      || (req.get('Authorization') || '').replace(/Bearer/g, '').trim() || null);
    const debugInfo = JSON.stringify({ query: req.query, body: req.body, token });
    const message = `${debugInfo} - @punith ${count(type)} requests to ${type} from ip:${
      req.ip}, blocked for ${WINDOW[type]} minute & `;

    if (token && token.length >= 40) {
      db.AccessToken.find({
        where: {
          access_token: token.replace(/Bearer/g, '').trim(),
        },
        include: [{ model: db.Auth, attributes: ['id', 'email'] }],
      }).then((t) => {
        Notify.slack(`${message} User: ${t.Auth ? t.Auth.get('email') : ''}`);
      });
    } else {
      Notify.slack(`${message} user details not found.`);
    }
  }
}

const settings = (db, type = 'api') => {
  log('settings', { type });
  const message = `${count(type)} requests to ${type} from this IP, try after a ${WINDOW[type]} minute`;

  const options = {
    windowMs: WINDOW.api * 60 * 1000, // 15 minutes
    max: API_THROTTLE_LIMIT, // limit each IP to 100 requests per windowMs
    delayMs: 0, // disable delaying - full speed until the max limit is reached
    statusCode: 429,
    message,
    keyGenerator(req) {
      return req.ip;
    },
    handler(req, res) {
      res.format({
        html() {
          checkNotify(db, req, type);
          res.status(429).end(message);
        },
        json() {
          checkNotify(db, req, type);
          res.status(429).json({ message });
        },
      });
    },
  };

  if (type === 'auth') {
    return {
      ...options,
      windowMs: WINDOW.auth * 60 * 1000, // 1 minute
      max: ACCOUNT_THROTTLE_LIMIT, // limit each IP to 100 requests per windowMs
    };
  }

  return options;
};

module.exports = (type, db) => {
  log('rateLimit', { type, env });
  if (env !== 'production') return (req, res, next) => next();

  return new RateLimit(settings(db, type));
};
