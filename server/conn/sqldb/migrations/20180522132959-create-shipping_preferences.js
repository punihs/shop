const { engine, timestamps, keys } = require('../helper.js');

module.exports = {
  up: (queryInterface, DataTypes) => queryInterface.createTable('shipping_preferences', Object.assign({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    standard_photo: {
      type: DataTypes.ENUM,
      values: ['0', '1'],
    },
    advance_photo: {
      type: DataTypes.ENUM,
      values: ['0', '1'],
    },
    scan_doc: {
      type: DataTypes.ENUM,
      values: ['0', '1'],
    },
    repack: {
      type: DataTypes.ENUM,
      values: ['0', '1'],
    },
    sticker: {
      type: DataTypes.ENUM,
      values: ['0', '1'],
    },
    pack_extra: {
      type: DataTypes.ENUM,
      values: ['0', '1'],
    },
    orginal_box: {
      type: DataTypes.ENUM,
      values: ['0', '1'],
    },
    max_weight: DataTypes.DOUBLE(8, 2),
    gift_wrap: {
      type: DataTypes.ENUM,
      values: ['0', '1'],
    },
    gift_note: {
      type: DataTypes.ENUM,
      values: ['0', '1'],
    },
    tax_id: DataTypes.STRING,
    personal: {
      type: DataTypes.ENUM,
      values: ['0', '1'],
    },
    include_invoice: {
      type: DataTypes.ENUM,
      values: ['0', '1'],
    },
    customer_id: keys('users'),
  }, timestamps(3, DataTypes)), engine),
  down(queryInterface) {
    return queryInterface.dropTable('shipping_preferences');
  },
};
