const Sequelize = require('sequelize');

module.exports = {
  up: (queryInterface) => {
    queryInterface.addColumn(
      'packages',
      'is_restricted_item',
      {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
    );
  },
};
