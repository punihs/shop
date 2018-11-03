module.exports = DataTypes => ({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
    unique: true,
  },
  repack: DataTypes.TINYINT,
  repacking_charge_amount: DataTypes.DOUBLE,
  sticker: DataTypes.TINYINT,

  sticker_charge_amount: DataTypes.DOUBLE,
  extra_packing: DataTypes.TINYINT,
  extra_packing_charge_amount: DataTypes.DOUBLE,
  original: DataTypes.TINYINT,
  original_ship_box_charge__amount: DataTypes.DOUBLE,
  max_weight: DataTypes.FLOAT,
  consolidation: DataTypes.TINYINT,
  consolidation_charge_amount: DataTypes.DOUBLE,
  gift_wrap: DataTypes.TINYINT,
  gift_wrap_charge_amount: DataTypes.DOUBLE,
  gift_note: DataTypes.TINYINT,
  gift_note_charge_amount: DataTypes.DOUBLE,
  gift_note_text: DataTypes.STRING,
  insurance: DataTypes.TINYINT,
  insurance_amount: DataTypes.DOUBLE,
  is_liquid: DataTypes.TINYINT,
  liquid_charge_amount: DataTypes.DOUBLE,
  overweight: DataTypes.TINYINT,
  overweight_charge_amount: DataTypes.DOUBLE,
  invoice_tax_id: DataTypes.STRING,
  mark_personal_use: DataTypes.TINYINT,
  invoice_include: DataTypes.TINYINT,
});
