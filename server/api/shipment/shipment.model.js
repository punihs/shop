const properties = require('./shipment.property');

module.exports = (sequelize, DataTypes) => {
  const Shipment = sequelize.define('Shipment', properties(DataTypes), {
    tableName: 'shipments',
    timestamps: true,
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

    Shipment.belongsTo(db.Address, {
      foreignKey: 'address_id',
    });
    Shipment.hasMany(db.Package);
    Shipment.hasOne(db.ShipmentMeta, {
      foreignKey: 'id',
    });

    Shipment.belongsTo(db.ShipmentState, {
      defaultScope: {
        where: { status: 1 },
      },
      foreignKey: 'shipment_state_id',
    });

    Shipment.belongsTo(db.Country);

    db.Country.hasMany(Shipment);
  };
  return Shipment;
};

