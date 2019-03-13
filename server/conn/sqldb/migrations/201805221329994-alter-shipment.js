const Sequelize = require('sequelize');

module.exports = {
  up: (queryInterface) => {
    queryInterface.addColumn(
      'shipments',
      'box_length',
      {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true,
        defaultValue: 0,
      },
    );
    queryInterface.addColumn(
      'shipments',
      'box_height',
      {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true,
        defaultValue: 0,
      },
    );
    queryInterface.addColumn(
      'shipments',
      'box_width',
      {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true,
        defaultValue: 0,
      },
    );
  },
};
