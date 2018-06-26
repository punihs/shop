const { redemption } = require('./../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('redemptions', redemption, {});
  },

  down(queryInterface) {
    return queryInterface.bulkDelete('redemptions', { id: redemption.map(x => x.id) });
  },
};
