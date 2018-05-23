const { engine, timestamps, keys } = require('../helper.js');

module.exports = {
  up(queryInterface, DataTypes) {
    return queryInterface.createTable('users', Object.assign({
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      salutation: DataTypes.STRING,
      first_name: DataTypes.STRING,
      last_name: DataTypes.STRING,
      locker_code: DataTypes.STRING,
      phone: DataTypes.BIGINT,
      email: DataTypes.STRING(50),
      password: DataTypes.STRING,
      group_id: keys('groups'),
    }, timestamps(3, DataTypes)), engine)
      .then(() => queryInterface.addColumn('users', 'referred_by', keys('users')));
  },
  down(queryInterface) {
    return queryInterface.dropTable('users');
  },
};
