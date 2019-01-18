const Sequelize = require('sequelize');

module.exports = {
  up: (queryInterface) => {
    queryInterface.addColumn(
      'package_items',
      'package_order_code',
      {
        type: Sequelize.STRING,
        allowNull: true,
      },
    );
  },
};
