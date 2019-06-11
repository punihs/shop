const { personalShopperState } = require('./../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert(
      'states', personalShopperState,
      {},
    );
  },
  down(queryInterface) {
    return queryInterface.bulkDelete('states', { id: personalShopperState.map(x => x.id) });
  },
};
