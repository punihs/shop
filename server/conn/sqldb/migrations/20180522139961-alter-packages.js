const Sequelize = require('sequelize');

module.exports = {
  up: (queryInterface) => {
    queryInterface.addColumn(
      'packages',
      'splitting_directions',
      {
        type: Sequelize.STRING,
        allowNull: true,
      },
    );
    queryInterface.addColumn(
      'packages',
      'return_send',
      {
        type: Sequelize.STRING,
        allowNull: true,
      },
    );
  },
};
