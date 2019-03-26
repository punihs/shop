const Sequelize = require('sequelize');

module.exports = {
  up: (queryInterface) => {
    queryInterface.addColumn(
      'users',
      'referer',
      {
        type: Sequelize.STRING,
        allowNull: true,
      },
    );
    queryInterface.addColumn(
      'users',
      'first_visit',
      {
        type: Sequelize.STRING,
        allowNull: true,
      },
    );
    queryInterface.addColumn(
      'users',
      'utm_campaign',
      {
        type: Sequelize.STRING,
        allowNull: true,
      },
    );
    queryInterface.addColumn(
      'users',
      'utm_source',
      {
        type: Sequelize.STRING,
        allowNull: true,
      },
    );
    queryInterface.addColumn(
      'users',
      'utm_medium',
      {
        type: Sequelize.STRING,
        allowNull: true,
      },
    );
    queryInterface.addColumn(
      'users',
      'gcl_id',
      {
        type: Sequelize.STRING,
        allowNull: true,
      },
    );
  },
};
