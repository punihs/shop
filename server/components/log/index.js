
const _ = require('lodash');
const logger = require('../../components/logger');

module.exports = {
  activityLogger({ db }) {
    return (req, res) => {
      const {
        query, body, method, originalUrl,
      } = req;

      const log = {
        response_time: res.get('X-Response-Time'),
        body_bytes_sent: 10,
        status: res.statusCode,
        request: originalUrl,
        method,
      };

      if (req.oauth && req.oauth.bearerToken) log.session_id = req.oauth.bearerToken.session_id;

      if (!_.isEmpty(req.query)) log.query = query;

      if (!_.isEmpty(req.body)) {
        log.body = _.cloneDeep(body);
      }

      db.Log
        .create(log, { logging: false })
        .catch(err => logger.error('activity', err));
    };
  },
};
