const properties = require('./shipment.property');

module.exports = (sequelize, DataTypes) => {
  const Shipment = sequelize.define('Shipment', properties(DataTypes), {
    tableName: 'shipments',
    timestamps: false,
    underscored: true,
    paranoid: true,
  });

  Shipment.associate = (db) => {
    Shipment.belongsTo(db.User, {
      foreignKey: 'customer_id',
      as: 'Customer',
    });

    Shipment.belongsTo(db.User, {
      foreignKey: 'created_by',
      as: 'Creator',
    });

    Shipment.belongsTo(db.PaymentGateway);
    Shipment.belongsTo(db.Place, {
      foreignKey: 'destination_city_id',
    });
    db.Place.hasMany(Shipment, {
      foreignKey: 'destination_city_id',
    });

    Shipment.belongsTo(db.Country);
    Shipment.belongsTo(db.ShipmentType);
    db.Country.hasMany(Shipment);
  };

  return Shipment;
};

