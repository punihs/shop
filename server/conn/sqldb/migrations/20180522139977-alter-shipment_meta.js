const Sequelize = require('sequelize');

module.exports = {
  up: (queryInterface) => {
    queryInterface.addColumn(
      'shipment_meta',
      'other_charge_amount',
      {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true,
      },
    );
  },
};
