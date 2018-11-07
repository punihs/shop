
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
    Package.hasOne(db.PackageCharge, {
      foreignKey: 'id',
    });
    Package.hasOne(db.Store);
    Package.belongsTo(db.Shipment);
    Package.belongsTo(db.User, {
      foreignKey: 'customer_id',
      as: 'Customer',
    });

    Package.belongsTo(db.PackageState, {
      defaultScope: {
        where: { status: 1 },
      },
      foreignKey: 'package_state_id',
    });

    Package.hasMany(db.PackageItem);
    Package.hasMany(db.PhotoRequest);
    Package.hasMany(db.PackageState, {
      as: 'PackageStates',
      foreignKey: 'state_id',
    });

    Package.belongsTo(db.User, {
      foreignKey: 'created_by',
      as: 'Creator',
    });

    Package.belongsTo(db.User, {
      foreignKey: 'updated_by',
      as: 'Updater',
    });

    Package.belongsTo(db.Store);
  };

  return Package;
};

