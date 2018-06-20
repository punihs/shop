const {
  engine, timestamps, properties,
} = require('../helper.js');

module.exports = {
  up(queryInterface, DataTypes) {
    return queryInterface.createTable('password_reset', Object
      .assign(properties('passwordReset', DataTypes), {
      }, timestamps(3, DataTypes)), engine);
  },
  down(queryInterface) {
    return queryInterface.dropTable('password_reset');
  },
};
