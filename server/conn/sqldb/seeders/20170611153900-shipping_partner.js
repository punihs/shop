const { shippingPartners } = require('./../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('shipping_partners', shippingPartners, {});
  },

  down(queryInterface) {
    return queryInterface.bulkDelete('shipping_partners', { id: [1] });
  },
};
