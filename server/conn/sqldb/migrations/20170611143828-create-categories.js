const { engine, timestamps } = require('../helper.js');

module.exports = {
  up: (queryInterface, DataTypes) => queryInterface.createTable('categories', Object.assign({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    name: DataTypes.STRING,
    url_key: DataTypes.STRING,
    description: DataTypes.STRING(10000),
    return_policy_id: DataTypes.INTEGER,
    return_policy_text: DataTypes.STRING,
  }, timestamps(3, DataTypes)), engine),
  down(queryInterface) {
    return queryInterface.dropTable('categories');
  },
};
