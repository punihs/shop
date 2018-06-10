const { coupons } = require('./../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('coupons', coupons, {});
  },

  down(queryInterface) {
    return queryInterface.bulkDelete('coupons', { id: coupons.map(x => x.id) });
  },
};
