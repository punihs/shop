const properties = require('./afterShipCarriers.property');

module.exports = (sequelize, DataTypes) => {
  const AfterShipCarriers = sequelize.define('AfterShipCarriers', properties(DataTypes), {
    tableName: 'afterShip_carriers',
    timestamps: true,
    paranoid: true,
    underscored: true,
  });

  return AfterShipCarriers;
};
