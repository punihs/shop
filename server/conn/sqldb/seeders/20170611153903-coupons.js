const { coupon } = require('./../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('coupons', coupon, {});
  },

  down(queryInterface) {
    return queryInterface.bulkDelete('coupons', { id: coupon.map(x => x.id) });
  },
};
