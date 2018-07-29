
const {
  engine, timestamps, keys, properties, id,
} = require('../helper.js');

module.exports = {
  up: (queryInterface, DataTypes) => queryInterface
    .createTable('socket_sessions', {
      id,
      ...properties('socketSession', DataTypes),
      access_token_id: keys('access_tokens'),
      user_id: keys('users'),
      ...timestamps(2, DataTypes),
    }, engine),
  down(queryInterface) {
    return queryInterface.dropTable('socket_sessions');
  },
};
