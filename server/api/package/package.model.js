const debug = require('debug');

const log = debug('s.api.package.model');
const properties = require('./package.property');
const {
  PACKAGE_STATE_IDS: { SHIP },
} = require('../../config/constants');

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
    Package.hasOne(db.PackageMeta, {
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

    Package.hasMany(db.PackageState, {
      as: 'PackageStates',
      foreignKey: 'state_id',
    });

    Package.belongsTo(db.User, {
      foreignKey: 'created_by',
      as: 'Creator',
    });
    Package.belongsTo(db.Store);
  };

  Package.updateState = ({
    db,
    nextStateId,
    packageId,
    actingUser,
  }) => {
    log('updateState', nextStateId);
    return db.PackageState
      .create({
        package_id: packageId,
        user_id: actingUser.id,
        state_id: nextStateId,
      })
      .then((packageState) => {
        switch (nextStateId) {
          case SHIP: {
            log('state changed', SHIP);
            break;
          }
          default: {
            log('state changed default');
          }
        }

        return db.Package
          .update({
            package_state_id: packageState.id,
          }, {
            where: { id: packageId },
          });
      });
  };

  return Package;
};

