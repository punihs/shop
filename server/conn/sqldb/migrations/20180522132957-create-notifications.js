const { engine, timestamps, keys } = require('../helper.js');

module.exports = {
  up: (queryInterface, DataTypes) => queryInterface.createTable('notifications', Object.assign({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    action_type: DataTypes.STRING,
    action_id: DataTypes.INTEGER,
    action_description: DataTypes.STRING,
    solve_status: DataTypes.STRING,
    customer_id: keys('users'),
  }, timestamps(3, DataTypes)), engine),
  down(queryInterface) {
    return queryInterface.dropTable('notifications');
  },
};
