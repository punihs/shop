const Sequelize = require('sequelize');

module.exports = {
  up: (queryInterface) => {
    queryInterface.addColumn(
      'packages',
      'transaction_id',
      {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
    );
  },
};
