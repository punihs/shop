const debug = require('debug');

const log = debug('s.api.package.model');
const logger = require('../../components/logger');
const properties = require('./package.property');
const notification = require('./package.notification');
const {
  PACKAGE_STATE_IDS: { CREATED, SHIP },
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

    Package.hasMany(db.PackageItem);
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
    pkg,
    actingUser,
    comments = null,
  }) => {
    log('updateState', nextStateId);
    const options = {
      package_id: pkg.id,
      user_id: actingUser.id,
      state_id: nextStateId,
    };

    if (comments) options.comments = comments;
    if ([CREATED].includes(nextStateId)) options.comments = 'Package Recieved';

    return db.PackageState
      .create(options)
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

        if ([CREATED].includes(nextStateId)) {
          notification
            .stateChange({
              db,
              nextStateId,
              pkg,
              actingUser,
            })
            .catch(err => logger.error('statechange notification', nextStateId, pkg, err));
        }

        return db.Package
          .update({
            package_state_id: packageState.id,
          }, {
            where: { id: pkg.id },
          });
      });
  };

  return Package;
};

