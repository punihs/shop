const Sequelize = require('sequelize');

module.exports = {
  up: (queryInterface) => {
    queryInterface.addColumn(
      'package_items',
      'received_date',
      {
        type: Sequelize.DATE,
        allowNull: true,
      },
    );
  },
};
