const Sequelize = require('sequelize');

module.exports = {
  up: (queryInterface) => {
    queryInterface.addColumn(
      'shipments',
      'after_ship_id',
      {
        type: Sequelize.STRING,
      },
    );
  },
};
