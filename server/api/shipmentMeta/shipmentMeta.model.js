const properties = require('./shipmentMeta.property');

module.exports = (sequelize, DataTypes) => {
  const ShipmentMeta = sequelize.define('ShipmentMeta', properties(DataTypes), {
    tableName: 'shipment_meta',
    timestamps: false,
    underscored: true,
    paranoid: true,
  });
  return ShipmentMeta;
};
