const debug = require('debug');
const hookshot = require('../conn/hookshot');
const viewConfig = require('../view.config');

const log = debug('s-api-package-notification');

const { User } = require('../conn/sqldb');

const { PACKAGE_STATE_ID_NAMES_MAP } = require('../config/constants');

const toJSON = object => (object.toJSON ? object.toJSON() : object);

exports.stateChange = async ({
  actingUser, pkg, nextStateId, gateway, paymentGateway, packageStorageLimit,
  packageStorageExceededCharge,
}) => {
  log('statechange');
  try {
    const customer = await User
      .findById(pkg.customer_id, {
        attributes: [
          'name', 'salutation', 'first_name', 'last_name', 'email', 'virtual_address_code',
        ],
      });

    return hookshot.trigger('package:stateChange', {
      before: null,
      nextStateId,
      nextStateName: PACKAGE_STATE_ID_NAMES_MAP[nextStateId],
      pkg,
      customer: toJSON(customer),
      actingUser,
      gateway,
      paymentGateway,
      ENV: viewConfig,
      INCOMING: true,
      packageStorageLimit,
      packageStorageExceededCharge,
    });
  } catch (err) {
    return err;
  }
};

exports.create = ({
  actingUser, pkg, next,
}) => {
  try {
    return hookshot.trigger('package:create', {
      actingUser,
      pkg,
    });
  } catch (err) {
    return next(err);
  }
};
