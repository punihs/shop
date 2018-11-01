const { paymentGateway } = require('../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('payment_gateways', paymentGateway, {});
  },

  down(queryInterface) {
    return queryInterface.destroy('payment_gateways', { truncate: true, cascade: false });
  },
};
