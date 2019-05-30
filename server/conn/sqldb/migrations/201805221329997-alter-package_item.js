const Sequelize = require('sequelize');

module.exports = {
  up: (queryInterface) => {
    queryInterface.addColumn(
      'package_items',
      'deleted_by',
      {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
    );
  },
};
