const { shipmentState } = require('../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('shipment_states', shipmentState, {});
  },

  down(queryInterface) {
    return queryInterface.bulkDelete('shipment_states', { id: [1] });
  },
};
