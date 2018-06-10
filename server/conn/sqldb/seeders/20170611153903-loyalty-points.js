const { loyaltyPoints } = require('./../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('loyalty_points', loyaltyPoints, {});
  },

  down(queryInterface) {
    return queryInterface.bulkDelete('loyalty_points', { id: loyaltyPoints.map(x => x.id) });
  },
};
