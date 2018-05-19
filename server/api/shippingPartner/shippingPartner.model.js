
module.exports = (sequelize, DataTypes) => {
  const ShippingPartner = sequelize.define('ShippingPartner', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    name: DataTypes.INTEGER,
  }, {
    tableName: 'shipping_partners',
    timestamps: false,
    underscored: true,
  });

  return ShippingPartner;
};

