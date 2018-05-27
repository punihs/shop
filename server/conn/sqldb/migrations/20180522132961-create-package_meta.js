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
    wrong_address_amount: DataTypes.DECIMAL(8, 2),
    special_handlig_amount: DataTypes.DECIMAL(8, 2),
    charge_amount: DataTypes.DECIMAL(8, 2),
    pickup_amount: DataTypes.DECIMAL(8, 2),
    basic_photo_amount: DataTypes.DECIMAL(8, 2),
    standard_photo_amount: DataTypes.DECIMAL(8, 2),
    split_charge_amount: DataTypes.DECIMAL(8, 2),
    scan_doc_amount: DataTypes.DECIMAL(8, 2),
    package_id: keys('packages'),
  }, timestamps(3, DataTypes)), engine),
  down(queryInterface) {
    return queryInterface.dropTable('package_meta');
  },
};
