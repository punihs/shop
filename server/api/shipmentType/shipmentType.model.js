
module.exports = (sequelize, DataTypes) => {
  const ShipmentType = sequelize.define('ShipmentType', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    name: DataTypes.STRING,
  }, {
    tableName: 'shipment_types',
    timestamps: false,
    underscored: true,
  });

  return ShipmentType;
};

