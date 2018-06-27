module.exports = DataTypes => ({
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  is_basic_photo: DataTypes.BOOLEAN,
  is_advanced_photo: DataTypes.BOOLEAN,
  is_scan_document: DataTypes.BOOLEAN,
  is_repacking: DataTypes.BOOLEAN,
  is_sticker: DataTypes.BOOLEAN,
  is_extra_packing: DataTypes.BOOLEAN,
  is_original_box: DataTypes.BOOLEAN,

  is_gift_wrap: DataTypes.BOOLEAN,
  is_gift_note: DataTypes.BOOLEAN,
  is_mark_personal_use: DataTypes.BOOLEAN,
  is_include_invoice: DataTypes.BOOLEAN,

  max_weight: DataTypes.DOUBLE(8, 2),

  tax_id: DataTypes.STRING,
});
