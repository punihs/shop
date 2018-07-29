const properties = require('./dhlLog.property');

module.exports = (sequelize, DataTypes) => {
  const DhlLog = sequelize.define('DhlLog', properties(DataTypes), {
    tableName: 'dhl_logs',
    timestamps: false,
    underscored: true,
    createdAt: 'created_at',
  });

  DhlLog.associate = (db) => {
    DhlLog.belongsTo(db.Shipment);
  };

  return DhlLog;
};
