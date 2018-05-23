const { engine, timestamps, keys } = require('../helper.js');

module.exports = {
  up(queryInterface, DataTypes) {
    return queryInterface.createTable('refresh_tokens', Object.assign({
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      user_id: keys('users'),
      session_id: keys('sessions'),
      app_id: keys('apps'),
      status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      refresh_token: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      expires: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    }, timestamps(3, DataTypes)), engine);
  },
  down(queryInterface) {
    return queryInterface.dropTable('refresh_tokens');
  },
};
