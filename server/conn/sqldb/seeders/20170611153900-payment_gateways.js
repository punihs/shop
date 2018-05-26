const paymentGateways = require('./data/payment_gateways');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('payment_gateways', paymentGateways, {});
  },

  down(queryInterface) {
    return queryInterface.destroy('payment_gateways', { truncate: true, cascade: false });
  },
};
