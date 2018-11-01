const {
  engine, timestamps, properties, keys,
} = require('../helper.js');

module.exports = {
  up(queryInterface, DataTypes) {
    return queryInterface
      .createTable('loyalty_points', Object
        .assign(properties('loyaltyPoint', DataTypes), {
          customer_id: keys('users'),
        }, timestamps(3, DataTypes)), engine);
  },
  down(queryInterface) {
    return queryInterface.dropTable('loyalty_points');
  },
};
