const { engine, timestamps } = require('../helper.js');

module.exports = {
  up: (queryInterface, DataTypes) => queryInterface
    .createTable('store_categories', Object
      .assign({
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: DataTypes.INTEGER,
        },
        category: DataTypes.STRING,
        slug: DataTypes.STRING,
      }, timestamps(3, DataTypes)), engine),
  down(queryInterface) {
    return queryInterface.dropTable('store_categories');
  },
};
