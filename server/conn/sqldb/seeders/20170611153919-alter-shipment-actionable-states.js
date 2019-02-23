const { shipmentInactiveActionableState } = require('./../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('actionable_states', shipmentInactiveActionableState);
  },
  down(queryInterface) {
    return queryInterface
      .bulkDelete('actionable_states', { id: shipmentInactiveActionableState.map(x => x.id) });
  },
};
