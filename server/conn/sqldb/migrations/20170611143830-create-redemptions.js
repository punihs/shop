const {
  engine, timestamps, properties, keys,
} = require('../helper.js');

module.exports = {
  up(queryInterface, DataTypes) {
    return queryInterface
      .createTable('redemptions', Object
        .assign(properties('redemption', DataTypes), {
          customer_id: keys('users'),
        }, timestamps(3, DataTypes)), engine);
  },
  down(queryInterface) {
    return queryInterface.dropTable('redemptions');
  },
};
