const properties = require('./shipmentState.property');

module.exports = (sequelize, DataTypes) => {
  const ShipmentState = sequelize.define('ShipmentState', properties(DataTypes), {
    tableName: 'shipment_states',
    timestamps: true,
    underscored: true,
    defaultScope: {
      where: { status: 1 },
    },
  });

  ShipmentState.associate = (db) => {
    ShipmentState.hasMany(db.Shipment);

    ShipmentState.belongsTo(db.State, {
      foreignKey: 'state_id',
    });

    ShipmentState.belongsTo(db.User, {
      foreignKey: 'user_id',
    });
  };

  return ShipmentState;
};
