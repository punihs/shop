const { engine, timestamps, keys } = require('../helper.js');

module.exports = {
  up: (queryInterface, DataTypes) => queryInterface.createTable('package_meta', Object.assign({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    storage_amount: DataTypes.DECIMAL(8, 2),
    handling_amount: DataTypes.DECIMAL(8, 2),
    pickup_amount: DataTypes.DECIMAL(8, 2),
    doc_amount: DataTypes.DECIMAL(8, 2),

    group_id: keys('packages'),
  }, timestamps(3, DataTypes)), engine),
  down(queryInterface) {
    return queryInterface.dropTable('package_meta');
  },
};
