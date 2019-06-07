const Sequelize = require('sequelize');

module.exports = {
  up: (queryInterface) => {
    queryInterface.addColumn(
      'packages',
      'rack_number',
      {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
    );
  },
};
