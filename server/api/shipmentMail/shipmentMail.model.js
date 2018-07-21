const properties = require('./shipmentMail.property');

module.exports = (sequelize, DataTypes) => {
  const ShipmentMail = sequelize.define('shipmentMail', properties(DataTypes), {
    tableName: 'shipment_mails',
    timestamps: true,
    underscored: true,
  });

  // ShipmentMail.associate = (db) => {
  //   ShipmentMail.hasMany(db.Shipment);
  //   ShipmentMail.belongsTo(db.Shipment);
  // };
  ShipmentMail.associate = (db) => {
    db.Shipment.hasMany(db.ShipmentMail);
    db.Shipment.belongsTo(ShipmentMail);
  };

  return ShipmentMail;
};
