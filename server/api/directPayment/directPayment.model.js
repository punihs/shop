const properties = require('./directPayment.property');

module.exports = (sequelize, DataTypes) => {
  const DirectPayment = sequelize.define('DirectPayment', properties(DataTypes), {
    tableName: 'direct_payments',
    timestamps: false,
    underscored: true,
    paranoid: true,
  });

  DirectPayment.associate = (db) => {
    DirectPayment.belongsTo(db.Shipment);
  };

  return DirectPayment;
};
