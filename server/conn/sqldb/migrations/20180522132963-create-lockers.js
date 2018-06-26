const {
  engine, timestamps, keys, properties,
} = require('../helper.js');

module.exports = {
  up: (queryInterface, DataTypes) => queryInterface
    .createTable('lockers', Object
      .assign(properties('locker', DataTypes), {
        customer_id: keys('users'),
      }, timestamps(2, DataTypes)), engine),
  down(queryInterface) {
    return queryInterface.dropTable('lockers');
  },
};
