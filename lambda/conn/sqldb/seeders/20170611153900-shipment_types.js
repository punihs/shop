const { shipmentType } = require('../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('shipment_types', shipmentType, {});
  },

  down(queryInterface) {
    return queryInterface.bulkDelete('shipment_types', { id: [1] });
  },
};
