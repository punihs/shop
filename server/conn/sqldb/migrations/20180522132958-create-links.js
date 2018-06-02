const { engine, timestamps, keys } = require('../helper.js');

module.exports = {
  up: (queryInterface, DataTypes) => queryInterface.createTable('links', Object.assign({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    name: DataTypes.STRING,
    url: DataTypes.STRING,
    object_type_id: keys('object_types'),
    object_id: DataTypes.INTEGER,
  }, timestamps(3, DataTypes)), engine),
  down(queryInterface) {
    return queryInterface.dropTable('links');
  },
};
