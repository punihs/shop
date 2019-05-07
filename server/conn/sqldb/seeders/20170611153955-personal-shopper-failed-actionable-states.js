const { personalShopperFailedActionableState } = require('./../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('actionable_states', personalShopperFailedActionableState);
  },
  down(queryInterface) {
    return queryInterface
      .bulkDelete('actionable_states', { id: personalShopperFailedActionableState.map(x => x.id) });
  },
};
