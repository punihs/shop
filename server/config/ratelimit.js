const RateLimit = require('express-rate-limit');

const Notify = require('./../components/notify');

const { THROTTLE_LIMIT } = require('../config/environment');

module.exports = (app, db) => {
  const blacklist = [];
  function checkNotify(req) {
    if (!blacklist.includes(req.ip)) {
      blacklist.push(req.ip);
      const token = (req.query.access_token
        || (req.get('Authorization') || '').replace(/Bearer/g, '').trim() || null);
      if (token && token.length >= 40) {
        db.AccessToken.find({
          where: {
            access_token: token.replace(/Bearer/g, '').trim(),
          },
          include: [{ model: db.User, attributes: ['id', 'email_id'] }],
        }).then((t) => {
          Notify.slack(`@punith Too many requests to api from ip:${
            req.ip} & User: ${t.User ? t.User.get('email_id') : ''}`);
        });
      } else {
        Notify.slack(`@punith Too many requests to api from ip:${
          req.ip} & user details not found.`);
      }
    }
  }

  const limiter = new RateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: THROTTLE_LIMIT, // limit each IP to 100 requests per windowMs
    delayMs: 0, // disable delaying - full speed until the max limit is reached
    statusCode: 429,
    message: 'Too many accounts created from this IP, please try again after an hour',
    blacklist: [],
    keyGenerator(req) {
      return req.ip;
    },
    handler(req, res) {
      res.format({
        html() {
          checkNotify(req);
          res.status(429)
            .end('Too many accounts created from this IP, please try again after an hour');
        },
        json() {
          checkNotify(req);
          res
            .status(429)
            .json({
              message: 'Too many accounts created from this IP, please try again after an hour',
            });
        },
      });
    },
  });
  // Apply to all requests
  app.use(limiter);
};
