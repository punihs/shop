const debug = require('debug');
const rp = require('request-promise');

const log = debug('ship-index');

const { COURIER } = require('../../../../config/environment');

module.exports = {
  getPricing({ country, weight, type }) {
    log('getPricing', { country, weight, type });

    const shippingCharge = rp({
      uri: `${COURIER}/api/pricing`,
      qs: { country, weight, type, all: true },
      json: true,
    });
    log({ shippingCharge });

    return shippingCharge;
  },
};
