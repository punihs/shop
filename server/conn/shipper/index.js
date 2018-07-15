const dhl = require('./dhl');

const { SHIPPING_PARTNERS: { DHL } } = require('../../config/constants/objects');

module.exports = {
  [DHL]: dhl,
};
