const debug = require('debug');
const rp = require('request-promise');

const log = debug('cash back');

const { URLS_PAY } = require('../../../../config/environment');

exports.transaction = async ({ transactionId, object_id, customer_id }) => {
  log('state customer_id ', customer_id);
  const transaction = rp({
    uri: `${URLS_PAY}/api/transactions/${transactionId}/transaction`,
    qs: { object_id, customer_id },
    json: true,
  });

  log(transaction);
  return transaction;
};
