const { codActionableState } = require('./../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('actionable_states', codActionableState);
  },
  down(queryInterface) {
    return queryInterface
      .bulkDelete('actionable_states', { id: codActionableState.map(x => x.id) });
  },
};
