const { shipmentInactiveToShipmentAbandon } = require('./../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('actionable_states', shipmentInactiveToShipmentAbandon);
  },
  down(queryInterface) {
    return queryInterface
      .bulkDelete('actionable_states', { id: shipmentInactiveToShipmentAbandon.map(x => x.id) });
  },
};
