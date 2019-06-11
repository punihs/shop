const Sequelize = require('sequelize');

module.exports = {
  up: (queryInterface) => {
    queryInterface.addColumn(
      'shipments',
      'upstream_cost',
      {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true,
        defaultValue: 0,
      },
    );

    queryInterface.addColumn(
      'shipments',
      'fuel_sur_charge',
      {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true,
        defaultValue: 0,
      },
    );

    queryInterface.addColumn(
      'shipments',
      'gst_amount',
      {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true,
        defaultValue: 0,
      },
    );
    queryInterface.addColumn(
      'shipments',
      'carton_box_used',
      {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 0,
      },
    );
    queryInterface.addColumn(
      'shipments',
      'carton_box_Amount',
      {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true,
        defaultValue: 0,
      },
    );
  },
};
