const { engine, timestamps, properties } = require('../helper.js');

module.exports = {
  up: (queryInterface, DataTypes) => queryInterface.createTable('coupons', Object
    .assign(properties('coupon', DataTypes), {
    }, timestamps(3, DataTypes)), engine),
  down(queryInterface) {
    return queryInterface.dropTable('coupons');
  },
};
