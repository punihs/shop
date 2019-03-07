const Sequelize = require('sequelize');

module.exports = {
  up: (queryInterface) => {
    queryInterface.addColumn(
      'shipment_meta',
      'express_processing',
      {
        type: Sequelize.TINYINT,
        allowNull: true,
        defaultValue: 0,
      },
    );
    queryInterface.addColumn(
      'shipment_meta',
      'express_processing_charge_amount',
      {
        type: Sequelize.DOUBLE(8, 2),
        allowNull: true,
        defaultValue: 0,
      },
    );
  },
};
