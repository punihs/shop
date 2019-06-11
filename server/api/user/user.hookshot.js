const debug = require('debug');

const hookshot = require('../../conn/hookshot');
const { ShippingPreference } = require('../../conn/sqldb');

const log = debug('s-api-user-notification');

exports.signup = async (customer) => {
  // - Todo use id as same as customer id
  await ShippingPreference.upsert({ id: customer.id, customer_id: customer.id });

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
