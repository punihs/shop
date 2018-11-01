const {
  engine, timestamps, properties, keys,
} = require('../helper.js');

module.exports = {
  up: (queryInterface, DataTypes) => queryInterface
    .createTable('transactions', Object
      .assign(
        properties('transaction', DataTypes),
        {
          customer_id: keys('users'),
          payment_gateway_id: keys('payment_gateways'),
        },
        timestamps(3, DataTypes),
      ), engine),
  down(queryInterface) {
    return queryInterface.dropTable('transactions');
  },
};
