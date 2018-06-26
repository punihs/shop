const {
  engine, timestamps, keys, properties,
} = require('../helper.js');

module.exports = {
  up(queryInterface, DataTypes) {
    return queryInterface
      .createTable('package_states', Object
        .assign(properties('packageState', DataTypes), {
          user_id: keys('users'),
          state_id: keys('states'),
        }, timestamps(3, DataTypes)), engine);
  },
  down(queryInterface) {
    return queryInterface.dropTable('package_states');
  },
};
