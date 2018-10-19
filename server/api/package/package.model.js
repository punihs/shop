const debug = require('debug');

const log = debug('s.api.package.model');
const logger = require('../../components/logger');
const properties = require('./package.property');

const notification = require('./package.notification');

const {
  PACKAGE_STATE_IDS: {
    PACKAGE_ITEMS_UPLOAD_PENDING, READY_TO_SHIP, RETURN_PICKUP_DONE,
    SPLIT_PACKAGE_PROCESSED,
  },
  TRANSACTION_TYPES: { DEBIT },
} = require('../../config/constants');

const {
  PACKAGE: { SPLIT_PACKAGE, RETURN },
} = require('../../config/constants/charges');

const stateIdcommentMap = {
  [PACKAGE_ITEMS_UPLOAD_PENDING]: 'Package Recieved',
  [SPLIT_PACKAGE_PROCESSED]: 'Package Splitted!', // email sending is pending
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
    lastStateId,
    nextStateId,
    pkg,
    actingUser,
    comments = null,
  }) => {
    log('updateState', nextStateId, pkg, comments);
    const options = {
      package_id: pkg.id,
      user_id: actingUser.id,
      state_id: nextStateId,
    };
    if (stateIdcommentMap[nextStateId]) options.comments = stateIdcommentMap[nextStateId];
    if (comments) options.comments = comments || stateIdcommentMap[nextStateId];

    return db.PackageState
      .create(options)
      .then((packageState) => {
        switch (nextStateId) {
          case READY_TO_SHIP: {
            log('state changed', READY_TO_SHIP);
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
          case SPLIT_PACKAGE_PROCESSED: {
            db.PackageCharge
              .update(
                { split_package_amount: SPLIT_PACKAGE },
                { where: { id: pkg.id } },
              );
            break;
          }
          case PACKAGE_ITEMS_UPLOAD_PENDING: {
            log({ PACKAGE_ITEMS_UPLOAD_PENDING });
            db.Locker
              .allocation({ customerId: pkg.customer_id });
            break;
          }
          case RETURN_PICKUP_DONE: {
            const transaction = {};
            const customerId = actingUser.id;
            transaction.type = DEBIT;
            transaction.customer_id = customerId;
            transaction.amount = RETURN;
            db.Transaction
              .create(transaction);
            break;
          }
          default: {
            log('state changed default');
          }
        }

        if ([PACKAGE_ITEMS_UPLOAD_PENDING].includes(nextStateId)) {
          notification
            .stateChange({
              db,
              nextStateId,
              lastStateId,
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

