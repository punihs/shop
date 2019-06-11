const Sequelize = require('sequelize');

module.exports = {
  up: (queryInterface) => {
    queryInterface.addColumn(
      'shipments',
      'carton_box_weight',
      {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true,
        defaultValue: 0,
      },
    );
  },
};
