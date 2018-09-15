const debug = require('debug');

const { stringify } = require('querystring');

const { URLS_API, AXIS } = require('../../../config/environment');


const log = debug('s.axis.controller');

exports.create = async (req, res, transaction) => {
  // Todo: need to change logic in nodejs
  log('amount', transaction.amount);
  res.json(`https://cp.shoppre.com/axis/api.php?&${stringify({
    final_amount: transaction.amount,
    payment_id: transaction.id,
    redirect_url: `${URLS_API}/api/transactions/${transaction.id}/complete`,
    ...AXIS,
  })}`);
};
