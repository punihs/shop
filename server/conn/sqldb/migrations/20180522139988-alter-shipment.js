const Sequelize = require('sequelize');

module.exports = {
  up: (queryInterface) => {
    queryInterface.addColumn(
      'shipments',
      'is_doc',
      {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
    );
  },
};
