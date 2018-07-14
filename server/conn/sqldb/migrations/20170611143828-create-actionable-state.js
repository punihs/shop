const {
  engine, timestamps, keys, properties,
} = require('../helper.js');

module.exports = {
  up(queryInterface, DataTypes) {
    return queryInterface
      .createTable('actionable_states', {
        ...properties('actionableState', DataTypes),
        state_id: keys('states'),
        group_id: keys('groups'),
        child_id: keys('states'),
        ...timestamps(3, DataTypes),
      }, engine);
  },
  down(queryInterface) {
    return queryInterface.dropTable('actionable_states');
  },
};
