
const _ = require('lodash');
const logger = require('../../components/logger');

const activityLogger = ({ db }) => (req, res) => {
  const {
    query, body, method, originalUrl,
  } = req;

  const log = {
    body_bytes_sent: 10,
    status: res.statusCode,
    request: originalUrl,
    method,
  };

  if (res.get('X-Response-Time')) {
    log.response_time = res.get('X-Response-Time').replace('ms', '');
  }

  if (req.oauth && req.oauth.bearerToken) log.session_id = req.oauth.bearerToken.session_id;

  if (!_.isEmpty(req.query)) log.query = query;

  if (!_.isEmpty(req.body)) {
    log.body = _.cloneDeep(body);
  }

  db.Log
    .create(log, { logging: false })
    .catch(err => logger.error('activity', err));
};

module.exports = {
  apiLogger: db => (req, res, next) => {
    res.on('finish', () => activityLogger({ db })(req, res, next));
    next();
  },
  activityLogger,
};
