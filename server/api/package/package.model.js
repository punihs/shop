
const properties = require('./package.property');

module.exports = (sequelize, DataTypes) => {
  const Package = sequelize.define(
    'Package',
    properties(DataTypes),
    {
      tableName: 'packages',
      timestamps: true,
      underscored: true,
      paranoid: true,
    },
  );

  Package.associate = (db) => {
    Package.hasOne(db.PackageMeta);
    Package.hasOne(db.Store);
    Package.belongsTo(db.Shipment);
    Package.belongsTo(db.User, {
      foreignKey: 'customer_id',
      as: 'Customer',
    });

    Package.belongsTo(db.User, {
      foreignKey: 'created_by',
      as: 'Creator',
    });
  };

  return Package;
};

