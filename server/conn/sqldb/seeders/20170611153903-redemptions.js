const { redemptions } = require('./../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('redemptions', redemptions, {});
  },

  down(queryInterface) {
    return queryInterface.bulkDelete('redemptions', { id: redemptions.map(x => x.id) });
  },
};
