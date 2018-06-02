const { engine, timestamps, keys } = require('../helper.js');

module.exports = {
  up(queryInterface, DataTypes) {
    return queryInterface.createTable('apps', Object.assign({
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },

      port: DataTypes.STRING(5),
      name: DataTypes.STRING,
      client_id: {
        type: DataTypes.STRING(64),
        unique: true,
      },
      client_secret: DataTypes.STRING(64),
      redirect_uri: DataTypes.STRING,
    }, {
      user_id: keys('users'),
      group_id: keys('groups'),
    }, timestamps(3, DataTypes)), engine);
  },
  down(queryInterface) {
    return queryInterface.dropTable('apps');
  },
};
