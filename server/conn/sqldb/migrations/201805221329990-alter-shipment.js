const Sequelize = require('sequelize');

module.exports = {
  up: (queryInterface) => {
    queryInterface.addColumn(
      'shipments',
      'afterShip_slug',
      {
        type: Sequelize.STRING,
        defaultValue: false,
      },
    );
  },
};
