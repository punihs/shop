const properties = require('./shipmentMail.property');

module.exports = (sequelize, DataTypes) => {
  const ShipmentMail = sequelize.define('ShipmentMail', properties(DataTypes), {
    tableName: 'shipment_mails',
    timestamps: true,
    underscored: true,
  });

  ShipmentMail.associate = (db) => {
    db.Shipment.hasMany(db.ShipmentMail);
  };

  return ShipmentMail;
};
