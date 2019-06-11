const Sequelize = require('sequelize');

module.exports = {
  up: (queryInterface) => {
    queryInterface.addColumn(
      'users',
      'wallet_balance_amount',
      {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0,
      },
    );
  },
};
