const { packageReadyToDiscardActionableState } = require('./../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('actionable_states', packageReadyToDiscardActionableState);
  },
  down(queryInterface) {
    return queryInterface
      .bulkDelete('actionable_states', { id: packageReadyToDiscardActionableState.map(x => x.id) });
  },
};
