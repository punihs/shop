
const {
  engine, timestamps, keys, properties, id,
} = require('../helper.js');

module.exports = {
  up: (queryInterface, DataTypes) => queryInterface
    .createTable('followers', {
      id,
      ...properties('follower', DataTypes),
      user_id: keys('users'),
      updated_by: keys('users'),
      shared_by: keys('users'),
      ...timestamps(3, DataTypes),
    }, engine),
  down(queryInterface) {
    return queryInterface.dropTable('followers');
  },
};
