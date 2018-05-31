module.exports = (sequelize, DataTypes) => {
  const ShipmentMeta = sequelize.define('ShipmentMeta', {
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
    repacking_charge_amount: DataTypes.DOUBLE,
    sticker: {
      type: DataTypes.ENUM,
      values: ['0', '1'],
    },

    sticker_charge_amount: DataTypes.DOUBLE,
    extrapack: {
      type: DataTypes.ENUM,
      values: ['0', '1'],
    },
    extra_packing_charge_amount: DataTypes.DOUBLE,
    original: {
      type: DataTypes.ENUM,
      values: ['0', '1'],
    },
    original_ship_box_charge__amount: DataTypes.DOUBLE,
    max_weight: DataTypes.FLOAT,
    consolidation: {
      type: DataTypes.ENUM,
      values: ['0', '1'],
    },
    consolidation_charge_amount: DataTypes.DOUBLE,
    gift_wrap: {
      type: DataTypes.ENUM,
      values: ['0', '1'],
    },
    gift_wrap_charge_amount: DataTypes.DOUBLE,
    gift_note: {
      type: DataTypes.ENUM,
      values: ['0', '1'],
    },
    gift_note_charge_amount: DataTypes.DOUBLE,
    giftnote_txt: DataTypes.STRING,
    insurance: {
      type: DataTypes.ENUM,
      values: ['0', '1'],
    },
    insurance_amount: DataTypes.DOUBLE,
    is_liquid: {
      type: DataTypes.ENUM,
      values: ['0', '1'],
    },
    liquid_charge_amount: DataTypes.DOUBLE,
    overweight: {
      type: DataTypes.ENUM,
      values: ['0', '1'],
    },
    overweight_charge_amount: DataTypes.FLOAT,
    profoma_taxid: DataTypes.STRING,
    profoma_personal: {
      type: DataTypes.ENUM,
      values: ['0', '1'],
    },
    invoice_include: {
      type: DataTypes.ENUM,
      values: ['0', '1'],
    },
  }, {
    tableName: 'shipment_meta',
    timestamps: true,
    underscored: true,
  });

  ShipmentMeta.associate = (db) => {
    ShipmentMeta.belongsTo(db.Shipment);
  };

  return ShipmentMeta;
};
