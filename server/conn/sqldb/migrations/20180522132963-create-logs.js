const {
  engine, timestamps, keys, properties,
} = require('../helper.js');

module.exports = {
  up: (queryInterface, DataTypes) => queryInterface.createTable('logs', Object
    .assign(properties('log', DataTypes), {
      session_id: keys('sessions'),
    }, timestamps(1, DataTypes)), engine),
  down(queryInterface) {
    return queryInterface.dropTable('logs');
  },
};
