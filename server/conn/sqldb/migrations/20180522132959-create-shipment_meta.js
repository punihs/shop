const { engine, timestamps, keys } = require('../helper.js');

module.exports = {
  up: (queryInterface, DataTypes) => queryInterface.createTable('shipment_meta', Object.assign({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    repack: {
      type: DataTypes.ENUM,
      values: ['0', '1'],
    },
    repack_amt: DataTypes.DOUBLE,
    sticker: {
      type: DataTypes.ENUM,
      values: ['0', '1'],
    },

    sticker_amt: DataTypes.DOUBLE,
    extrapack: {
      type: DataTypes.ENUM,
      values: ['0', '1'],
    },
    extrapack_amt: DataTypes.DOUBLE,
    original: {
      type: DataTypes.ENUM,
      values: ['0', '1'],
    },
    original_amt: DataTypes.DOUBLE,
    consolid: {
      type: DataTypes.ENUM,
      values: ['0', '1'],
    },

    consolid_amt: DataTypes.DOUBLE,
    gift_wrap: {
      type: DataTypes.ENUM,
      values: ['0', '1'],
    },
    giftwrap_amt: DataTypes.DOUBLE,
    gift_note: {
      type: DataTypes.ENUM,
      values: ['0', '1'],
    },
    giftnote_amt: DataTypes.DOUBLE,
    giftnote_txt: DataTypes.STRING,
    insurance: {
      type: DataTypes.ENUM,
      values: ['0', '1'],
    },
    insurance_amt: DataTypes.DOUBLE,
    liquid: {
      type: DataTypes.ENUM,
      values: ['0', '1'],
    },
    liquid_amt: DataTypes.DOUBLE,
    overweight: {
      type: DataTypes.ENUM,
      values: ['0', '1'],
    },
    overweight_amt: DataTypes.FLOAT,
    max_weight: DataTypes.FLOAT,
    profoma_taxid: DataTypes.STRING,
    profoma_personal: {
      type: DataTypes.ENUM,
      values: ['0', '1'],
    },
    invoice_include: {
      type: DataTypes.ENUM,
      values: ['0', '1'],
    },
    shipment_id: keys('shipments'),
  }, timestamps(3, DataTypes)), engine),
  down(queryInterface) {
    return queryInterface.dropTable('shipment_meta');
  },
};
