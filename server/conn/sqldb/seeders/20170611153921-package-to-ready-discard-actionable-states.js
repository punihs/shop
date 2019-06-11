const { packageDiscardToReadyActionableState } = require('./../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('actionable_states', packageDiscardToReadyActionableState);
  },
  down(queryInterface) {
    return queryInterface
      .bulkDelete('actionable_states', { id: packageDiscardToReadyActionableState.map(x => x.id) });
  },
};
