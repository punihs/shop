const Sequelize = require('sequelize');

module.exports = {
  up: (queryInterface) => {
    queryInterface.addColumn(
      'users',
      'is_courier_migrated',
      {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 0,
      },
    );
  },
};
