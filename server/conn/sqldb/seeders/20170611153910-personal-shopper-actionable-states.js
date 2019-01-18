const { personalShopperActionableState } = require('./../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('actionable_states', personalShopperActionableState);
  },
  down(queryInterface) {
    return queryInterface
      .bulkDelete('actionable_states', { id: personalShopperActionableState.map(x => x.id) });
  },
};
