const { engine, timestamps, properties } = require('../helper.js');

module.exports = {
  up: (queryInterface, DataTypes) => queryInterface
    .createTable('transactions', Object
      .assign(
        properties('transaction', DataTypes),
        timestamps(3, DataTypes),
      ), engine),
  down(queryInterface) {
    return queryInterface.dropTable('transactions');
  },
};
