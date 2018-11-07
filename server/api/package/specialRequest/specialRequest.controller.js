const debug = require('debug');
const {
  Package, Notification,
} = require('../../../conn/sqldb');
const db = require('../../../conn/sqldb');

const log = debug('s.api.package.specialRequest');
const {
  PACKAGE_STATE_IDS: { RETURN_REQUEST_FROM_CUSTOMER, SPLIT_PACKAGE, DISCARD_REQUESTED },
} = require('../../../config/constants');

const { updateState } = require('../package.service');

exports.return = async (req, res) => {
  const returnPackid = req.params.id;
  const customerId = req.user.id;
  let returnMsg = '';

  const pkg = await Package
    .find({
      where: { customer_id: customerId, id: returnPackid },
    });

  if (!pkg) return res.status(400).json({ message: 'package not found' });

  if (req.body.return_type === 'return_pickup') {
    returnMsg = 'return_pickup,'.concat(req.body.message1);
  } else {
    returnMsg = 'return_shoppre,'.concat(req.body.message2);
  }

  // sending mail is pending here
  await Package.update(
    { status: 'return', return_send: returnMsg },
    { where: { id: returnPackid } },
  );

  updateState({
    db,
    nextStateId: RETURN_REQUEST_FROM_CUSTOMER,
    pkg: { id: returnPackid },
    actingUser: req.user,
    comments: 'Return to sender requested',
  });

  const notification = {};
  notification.customer_id = customerId;
  notification.action_type = 'package';
  notification.action_id = returnPackid;
  notification.action_description = 'Return to sender requested - Order#'.concat(returnPackid);

  await Notification.create(notification);

  return res.status(201).json({ message: 'package return status updated' });
};

exports.split = async (req, res) => {
  const splitPackid = req.params.id;
  const customerId = req.user.id;
  let splitMsg = '';
  const options = {
    where: { customer_id: customerId, id: splitPackid },
  };
  const packages = await Package
    .find(options);
  if (packages) {
    splitMsg = req.body.message2;
  }
  // sending mail is pending here
  await Package.update(
    { status: 'split', splitting_directions: splitMsg },
    { where: { id: splitPackid } },
  );
  Package.updateState({
    db,
    nextStateId: SPLIT_PACKAGE,
    pkg: { id: splitPackid },
    actingUser: req.user,
    comments: 'Split Package requested',
  });
  const notification = {};
  notification.customer_id = customerId;
  notification.action_type = 'package';
  notification.action_id = splitPackid;
  notification.action_description = 'Split package requested - Order#'.concat(splitPackid);
  await Notification.create(notification)
    .then(() => res.status(201).json({ message: 'Your Split Package request has been submitted to shoppre team.' }));
};

exports.abandon = async (req, res) => {
  const abandonPackid = req.params.id;
  log('abandon', abandonPackid);
  const customerId = req.user.id;
  // sending mail is pending here
  await Package.update(
    { status: 'abandon' },
    { where: { id: abandonPackid } },
  );
  Package.updateState({
    db,
    nextStateId: DISCARD_REQUESTED,
    pkg: { id: abandonPackid },
    actingUser: req.user,
    comments: 'Abandon Package requested',
  });
  const notification = {};
  notification.customer_id = customerId;
  notification.action_type = 'package';
  notification.action_id = abandonPackid;
  notification.action_description = 'Abandon package request  - Order#'.concat(abandonPackid);
  await Notification.create(notification)
    .then(() => res.status(201).json({ message: 'All items in your package has been discarded as per your request. You can no longer retrieve the items in your package.' }));
};
