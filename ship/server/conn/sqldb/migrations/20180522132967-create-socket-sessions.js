
const {
  engine, timestamps, keys, properties, id,
} = require('../helper.js');

module.exports = {
  up: (queryInterface, DataTypes) => queryInterface
    .createTable('socket_sessions', {
      id,
      ...properties('socketSession', DataTypes),
      user_id: keys('users'),
      ...timestamps(2, DataTypes),
    }, engine),
  down(queryInterface) {
    return queryInterface.dropTable('socket_sessions');
  },
};
