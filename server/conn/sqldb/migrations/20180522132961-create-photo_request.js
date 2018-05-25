const { engine, timestamps, keys } = require('../helper.js');

module.exports = {
  up: (queryInterface, DataTypes) => queryInterface.createTable('photo_requests', Object.assign({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    type: {
      type: DataTypes.ENUM,
      values: ['standard', 'advanced'],
    },
    status: {
      type: DataTypes.ENUM,
      values: ['pending', 'completed'],
    },
    description: DataTypes.STRING,
    charge_amount: DataTypes.DECIMAL(8, 2),
    group_id: keys('packages'),
  }, timestamps(3, DataTypes)), engine),
  down(queryInterface) {
    return queryInterface.dropTable('photo_requests');
  },
};
