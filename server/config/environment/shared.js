const buckets = require('../constants/buckets');
const { PAYMENT_GATEWAY } = require('../constants');

module.exports = {
  2: {
    PACKAGE_STATES: Object.keys(buckets.PACKAGE[2]),
    PAYMENT_GATEWAY,
  },
};
