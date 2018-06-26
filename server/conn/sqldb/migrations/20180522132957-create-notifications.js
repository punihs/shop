const {
  engine, timestamps, keys, properties,
} = require('../helper.js');

module.exports = {
  up: (queryInterface, DataTypes) => queryInterface
    .createTable('notifications', Object
      .assign(properties('notification', DataTypes), {
        customer_id: keys('users'),
      }, timestamps(3, DataTypes)), engine),
  down(queryInterface) {
    return queryInterface.dropTable('notifications');
  },
};
