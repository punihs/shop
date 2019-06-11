const debug = require('debug');
const jwt = require('jsonwebtoken');

const hookshot = require('../../conn/hookshot');
const viewConfig = require('../../view.config');
const env = require('../../config/environment');
const {
  PACKAGE_STATE_ID_NAMES_MAP,
  PACKAGE_TYPES: { INCOMING, PERSONAL_SHOPPER, COD },
} = require('../../config/constants');
const { User, Store } = require('../../conn/sqldb');

const log = debug('s-api-package-notification');

const toJSON = object => (object.toJSON ? object.toJSON() : object);

exports.stateChange = async ({
  actingUser, pkg, nextStateId, lastStateId, next, paymentGateway, packageItems, comments,
}) => {
  try {
    const customer = await User
      .findById(pkg.customer_id, {
        attributes: [
          'id', 'name', 'salutation', 'first_name', 'last_name', 'email',
          'virtual_address_code', 'phone',
        ],
      });

    const otp = jwt.sign({ email: customer.email }, env.MASTER_TOKEN);

    const store = await Store
      .findById(pkg.store_id, { raw: true, attributes: ['name'] });

    log('package notification', { customer, pkg });
    const headers = {};

    hookshot
      .trigger('package:stateChange', {
        object: 'package',
        event: 'stateChange',
        before: lastStateId,
        after: nextStateId,
        nextStateName: [PACKAGE_STATE_ID_NAMES_MAP[nextStateId]],
        actingUser,
        pkg: { ...toJSON(pkg), Store: store },
        customer: toJSON(customer),
        ENV: viewConfig,
        paymentGateway,
        INCOMING: pkg.package_type === INCOMING,
        PERSONAL_SHOPPER: pkg.package_type === PERSONAL_SHOPPER,
        COD: pkg.package_type === COD,
        ORDER_ITEMS: !![PERSONAL_SHOPPER, COD].includes(pkg.package_type),
        packageItems,
        otp,
        comments,
      }, headers);
    return null;
  } catch (err) {
    return next(err);
  }
};

