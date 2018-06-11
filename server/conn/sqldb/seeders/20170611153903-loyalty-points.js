const { loyaltyPoint } = require('./../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('loyalty_points', loyaltyPoint, {});
  },

  down(queryInterface) {
    return queryInterface.bulkDelete('loyalty_points', { truncate: true, cascade: false });
  },
};
