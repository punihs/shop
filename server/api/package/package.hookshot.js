const debug = require('debug');

const hookshot = require('../../conn/hookshot');
const viewConfig = require('../../view.config');
const { PACKAGE_STATE_ID_NAMES_MAP } = require('../../config/constants');
const { User, Store } = require('../../conn/sqldb');

const log = debug('s-api-package-notification');

exports.stateChange = async ({
  actingUser, pkg, nextStateId, lastStateId, next,
}) => {
  try {
    const customer = await User
      .findById(pkg.customer_id, {
        attributes: [
          'id', 'name', 'salutation', 'first_name', 'last_name', 'email', 'virtual_address_code', 'phone',
        ],
      });

    const store = await Store
      .findById(pkg.store_id, { raw: true, attributes: ['name'] });

    log('package notification', { customer });
    const headers = {};
    await hookshot
      .trigger('package:stateChange', {
        object: 'package',
        event: 'stateChange',
        before: lastStateId,
        after: nextStateId,
        nextStateName: [PACKAGE_STATE_ID_NAMES_MAP[nextStateId]],
        actingUser,
        pkg: { ...pkg, Store: store },
        customer: customer.toJSON(),
        ENV: viewConfig,
      }, headers);
  } catch (err) {
    return next(err);
  }
};

