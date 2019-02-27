const Sequelize = require('sequelize');

module.exports = {
  up: (queryInterface) => {
    queryInterface.addColumn(
      'package_items',
      'ecommerce_link',
      {
        type: Sequelize.STRING,
        allowNull: true,
      },
    );
    queryInterface.addColumn(
      'package_items',
      'object_ecommerce',
      {
        type: Sequelize.STRING,
        allowNull: true,
      },
    );
  },
};
