const { shipmentMeta } = require('../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('shipment_meta', shipmentMeta, {});
  },

  down(queryInterface) {
    return queryInterface.bulkDelete('shipment_meta', { id: [1] });
  },
};
