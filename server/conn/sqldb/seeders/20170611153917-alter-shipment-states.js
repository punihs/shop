const { shipmentInactiveState } = require('./../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('states', shipmentInactiveState);
  },
  down(queryInterface) {
    return queryInterface
      .bulkDelete('states', { id: shipmentInactiveState.map(x => x.id) });
  },
};
