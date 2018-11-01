const debug = require('debug');

const hookshot = require('../../conn/hookshot');

const log = debug('s-api-user-notification');

exports.signup = async (customer) => {
  // - Send Verification Mail
  // - Partial Data from Controller

  // - Adding more datapoints required
  // - Sending full data to hooks
  log('signup', customer);
  const headers = {};
  return hookshot
    .trigger('user:signup', {
      object: 'user',
      event: 'signup',
      customer,
    }, headers);
};
