const Sequelize = require('sequelize');

module.exports = {
  up: (queryInterface) => {
    queryInterface.addColumn(
      'shipments',
      'payment_submit_date',
      {
        type: Sequelize.DATE,
        allowNull: true,
      },
    );
  },
};
