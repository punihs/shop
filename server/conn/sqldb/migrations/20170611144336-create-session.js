const { engine, timestamps, keys } = require('../helper.js');

module.exports = {
  up(queryInterface, DataTypes) {
    return queryInterface.createTable('sessions', Object.assign({
      id: {
        type: DataTypes.INTEGER(14),
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      user_id: keys('users'),
      device: DataTypes.STRING,
      os: DataTypes.STRING,
      browser: DataTypes.STRING,
      country: DataTypes.STRING,
      region: DataTypes.STRING,
      city: DataTypes.STRING,
      ip: DataTypes.STRING,
      latitude: DataTypes.STRING,
      longitude: DataTypes.STRING,
      metro: DataTypes.STRING,
      zip: DataTypes.STRING,
    }, timestamps(3, DataTypes)), engine);
  },
  down(queryInterface) {
    return queryInterface.dropTable('sessions');
  },
};
