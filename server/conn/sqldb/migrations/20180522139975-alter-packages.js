const Sequelize = require('sequelize');

module.exports = {
  up: (queryInterface) => {
    queryInterface.changeColumn(
      'packages',
      'comments',
      {
        type: Sequelize.STRING(5000),
        allowNull: true,
      },
    );
  },
};
