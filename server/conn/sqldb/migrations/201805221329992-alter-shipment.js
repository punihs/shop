const Sequelize = require('sequelize');

module.exports = {
  up: (queryInterface) => {
    queryInterface.addColumn(
      'shipments',
      'connecting_tracking_code',
      {
        type: Sequelize.STRING,
      },
    );
  },
};
