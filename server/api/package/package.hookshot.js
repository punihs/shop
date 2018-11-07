const debug = require('debug');

const hookshot = require('../../conn/hookshot');
const viewConfig = require('../../view.config');
const { PACKAGE_STATE_ID_NAMES_MAP } = require('../../config/constants');
const { User, Store } = require('../../conn/sqldb');

const log = debug('s-api-package-notification');

exports.stateChange = async ({
  actingUser, pkg, nextStateId, lastStateId,
}) => Promise
  .all([
    User
      .findById(pkg.customer_id, {
        attributes: [
          'id', 'name', 'salutation', 'first_name', 'last_name', 'email', 'virtual_address_code', 'phone',
        ],
      }),
    Store
      .findById(pkg.store_id, { raw: true, attributes: ['name'] }),
  ])
  .then(([customer, store]) => {
    log('package notification', { customer });
    const headers = {};
    hookshot
      .trigger('package:stateChange', {
        object: 'package',
        event: 'stateChange',
        before: lastStateId,
        after: nextStateId,
        nextStateName: [PACKAGE_STATE_ID_NAMES_MAP[nextStateId]],
        actingUser,
        pkg: { ...pkg, Store: store },
        customer,
        ENV: viewConfig,
      }, headers);
  });

