const { engine, timestamps, properties } = require('../helper.js');

module.exports = {
  up: (queryInterface, DataTypes) => queryInterface.createTable('virtual_addresses', Object
    .assign(properties('virtualAddress', DataTypes), timestamps(3, DataTypes)), engine),
  down(queryInterface) {
    return queryInterface.dropTable('virtual_addresses');
  },
};
