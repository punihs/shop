const { packageDiscardActionableState } = require('./../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('actionable_states', packageDiscardActionableState);
  },
  down(queryInterface) {
    return queryInterface
      .bulkDelete('actionable_states', { id: packageDiscardActionableState.map(x => x.id) });
  },
};
