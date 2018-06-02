const { engine, timestamps, keys } = require('../helper.js');

module.exports = {
  up(queryInterface, DataTypes) {
    return queryInterface.createTable('object_types', Object.assign({
      id: {
        type: DataTypes.INTEGER(14),
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      org_id: keys('orgs'),
      created_by: keys('users'),
      name: DataTypes.STRING,
      name_plural: DataTypes.STRING,
      url_base: DataTypes.STRING,
    }, timestamps(3, DataTypes)), engine);
  },
  down(queryInterface) {
    return queryInterface.dropTable('object_types');
  },
};
