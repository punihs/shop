const debug = require('debug');
const logger = require('../../../../components/logger');

let db;
const required = require;
const log = debug('s-conn-emails-ses-plugins-logging');

exports.start = ([params]) => Promise.resolve([params, {}]);

exports.end = ([params, emailLog, status]) => {
  log('logging.end', { emailLog });

  if (!db) db = required('../../../../conn/sqldb');

  db.EmailLog.create(emailLog).catch(err => logger.error('saving email logs', err, params));

  return Promise.resolve([params, emailLog, status]);
};
