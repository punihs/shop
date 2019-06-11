const Sequelize = require('sequelize');

module.exports = {
  up: (queryInterface) => {
    queryInterface.addColumn(
      'packages',
      'order_code',
      {
        type: Sequelize.STRING,
        allowNull: true,
      },
    );
  },
};
