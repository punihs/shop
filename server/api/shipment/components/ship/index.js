const debug = require('debug');
const rp = require('request-promise');

const log = debug('ship-index');

const { URLS_SHIP } = require('../../../../config/environment');

//   (countryId, toCreate.weight, packages[0].content_type)
module.exports = {
  getPricing({ countryId, weight, type }) {
    log('getPricing', { countryId, weight, type });

    const shippingCharge = rp({
      uri: `${URLS_SHIP}/api/pricing/calcShipping`,
      qs: { countryId, weight, type },
      json: true,
    });
    log({ shippingCharge });

    return shippingCharge;
  },
};
