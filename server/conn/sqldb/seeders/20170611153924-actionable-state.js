const { shipmentFailedToShipmentConfirm } = require('./../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('actionable_states', shipmentFailedToShipmentConfirm);
  },
  down(queryInterface) {
    return queryInterface
      .bulkDelete('actionable_states', { id: shipmentFailedToShipmentConfirm.map(x => x.id) });
  },
};
