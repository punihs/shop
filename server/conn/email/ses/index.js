
const debug = require('debug');
const connection = require('./connection');
const logging = require('./plugins/logging');
const preference = require('./plugins/preference');
const advertisement = require('./plugins/advertisement');
const deliver = require('./plugins/deliver');
const logger = require('../../../components/logger');

const log = debug('q-server-conn-ses-index');

const sendTemplatedEmail = (params) => {
  log('sendTemplatedEmail', params);
  return logging.start([params])

    // - preference check
    .then(preference)

    // - inject advertisements
    .then(advertisement)

    // - handover emails to aws ses
    .then(deliver)

    // - Finish log: update executation status in the table
    .then(logging.end)

    // - returning similar response as AWS SES
    .then(([,, status]) => status)
    .catch((err) => {
      log('err', err);
      if (err.code !== 400) {
        logging.end([params, err.data]);
        logger.error(err, params);
      }
      return Promise.reject(err);
    });
};

const email = {
  quarc: connection,
  sendTemplatedEmail,
  sendTemplatedEmailAsync: sendTemplatedEmail,
  send: sendTemplatedEmail,
};

module.exports = email;
