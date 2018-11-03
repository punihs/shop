const {
  engine, timestamps, keys, properties,
} = require('../helper.js');

module.exports = {
  up(queryInterface, DataTypes) {
    return queryInterface
      .createTable('group_states', Object
        .assign(properties('groupState', DataTypes), {
          group_id: keys('groups'),
          state_id: keys('states'),
        }, timestamps(3, DataTypes)), engine);
  },
  down(queryInterface) {
    return queryInterface.dropTable('group_states');
  },
};
