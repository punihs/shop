const { engine, timestamps } = require('../helper.js');

module.exports = {
  up: (queryInterface, DataTypes) => queryInterface.createTable('transactions', Object.assign({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    customer_id: DataTypes.INTEGER,
    amount: DataTypes.DECIMAL(15, 2),
    description: DataTypes.STRING,
  }, timestamps(3, DataTypes)), engine),
  down(queryInterface) {
    return queryInterface.dropTable('transactions');
  },
};
