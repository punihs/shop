const Sequelize = require('sequelize');

module.exports = {
  up: (queryInterface) => {
    queryInterface.addColumn(
      'packages',
      'package_received_date',
      {
        type: Sequelize.DATE,
        allowNull: true,
      },
    );
  },
};
