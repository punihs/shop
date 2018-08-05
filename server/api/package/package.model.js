const debug = require('debug');

const log = debug('s.api.package.model');
const logger = require('../../components/logger');
const properties = require('./package.property');
const notification = require('./package.notification');

const {
  PACKAGE_STATE_IDS: {
    CREATED, SHIP, RETURN_DONE, SPLIT_DONE, REVIEW, INVOICE, VALUES,
  },
  PACKAGE_CHARGES: { RETURN_CHARGE },
  TRANSACTION_TYPES: { DEBIT },
} = require('../../config/constants');

const stateIdcommentMap = {
  [CREATED]: 'Package Recieved',
  [VALUES]: 'Package waiting for customer input value action',
  [INVOICE]: 'Package under review for customer invoice upload',
  [REVIEW]: 'Package is under shoppre review',
  [SPLIT_DONE]: 'Package Splitted!', // email sending is pending
  [RETURN_DONE]: 'Package Returned to Sender!', // email sending is pending
};

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
      user_id: 646, // - actingUser.id,
      state_id: nextStateId,
    };
    if (stateIdcommentMap[nextStateId]) options.comments = stateIdcommentMap[nextStateId];
    if (comments) options.comments = comments || stateIdcommentMap[nextStateId];

    return db.PackageState
      .create(options)
      .then((packageState) => {
        switch (nextStateId) {
          case SHIP: {
            log('state changed', SHIP);
            // const photoRequest = await PhotoRequest.find({
            //   attributes: ['id'],
            //   where: {
            //     package_id: id,
            //   },
            // });
            //
            // if (photoRequest.status === 'pending') {
            //   return res.status(400)
            // res.json({ message: 'Please check and update the Photo Request Status !' });
            // }

            // - Todo: check number of items validation
            // else if (itemCount !== pack.number_of_items) {
            //   return res.status(400).res.json({ message: 'please check your items !' });
            // }
            break;
          }
          case VALUES: {
            pkg.getPackageItems()
              .then(packageItems => notification
                .stateChange({
                  db,
                  nextStateId,
                  pkg,
                  actingUser,
                  packageItems,
                }))
              .catch(err => logger.error('statechange notification', nextStateId, pkg, err));
            break;
          }
          case RETURN_DONE: {
            const customerId = actingUser.id;
            db.Transaction
              .Create({
                customer_id: customerId,
                type: DEBIT,
                amount: RETURN_CHARGE,
                description: `Return service fee deducted | Package ID ${pkg.id}`,
              });

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

