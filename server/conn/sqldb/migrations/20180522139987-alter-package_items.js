const Sequelize = require('sequelize');

module.exports = {
  up: (queryInterface) => {
    queryInterface.addColumn(
      'packages',
      'buy_if_price_changed',
      {
        type: Sequelize.STRING,
        allowNull: true,
      },
    );
  },
};
