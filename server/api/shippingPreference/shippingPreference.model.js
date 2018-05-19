module.exports = (sequelize, DataTypes) => {
  const ShippingPreference = sequelize.define('ShippingPreference', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
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
  }, {
    tableName: 'shipping_preferences',
    timestamps: true,
    underscored: true,
  });

  ShippingPreference.associate = (db) => {
    ShippingPreference.belongsTo(db.User);
  };

  return ShippingPreference;
};

