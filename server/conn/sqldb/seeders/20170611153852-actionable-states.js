const { actionableStates } = require('./../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('actionable_states', actionableStates);
  },
  down(queryInterface) {
    return queryInterface
      .bulkDelete('actionable_states', { id: actionableStates.map(x => x.id) });
  },
};
