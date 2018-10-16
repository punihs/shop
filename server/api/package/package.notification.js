const debug = require('debug');

const hookshot = require('../../conn/hookshot');
const viewConfig = require('../../emails/config');

const log = debug('s-api-package-notification');

exports.stateChange = async ({
  db: { User, Store }, actingUser, pkg, nextStateId, lastStateId,
}) => Promise
  .all([
    User
      .findById(pkg.customer_id, {
        attributes: [
          'name', 'salutation', 'first_name', 'last_name', 'email', 'virtual_address_code', 'phone',
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
        actingUser,
        pkg: { ...pkg, Store: store },
        customer,
        ENV: viewConfig,
      }, headers);
  });

