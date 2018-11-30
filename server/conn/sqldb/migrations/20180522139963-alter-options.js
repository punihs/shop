const Sequelize = require('sequelize');

module.exports = {
  up: (queryInterface) => {
    queryInterface.addColumn(
      'options',
      'key',
      {
        type: Sequelize.STRING,
      },
    );
    queryInterface.addColumn(
      'options',
      'value',
      {
        type: Sequelize.JSON,
      },
    );
  },
};
