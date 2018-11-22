const debug = require('debug');
const {
  Package,
} = require('../../../conn/sqldb');

const log = debug('s.api.package.specialRequest');
const {
  PACKAGE_STATE_IDS: { RETURN_REQUEST_FROM_CUSTOMER, SPLIT_PACKAGE, DISCARD_REQUESTED },
} = require('../../../config/constants');

const { updateState } = require('../package.service');

exports.return = async (req, res, next) => {
  try {
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

    await Package.update(
      { status: 'return', return_send: returnMsg },
      { where: { id: returnPackid } },
    );

    await updateState({
      nextStateId: RETURN_REQUEST_FROM_CUSTOMER,
      pkg: { id: returnPackid },
      actingUser: req.user,
      comments: 'Return to sender requested',
      next,
    });

    return res.status(201).json({ message: 'package return status updated' });
  } catch (err) {
    return next(err);
  }
};

exports.split = async (req, res, next) => {
  try {
    const splitPackid = req.params.id;
    const customerId = req.user.id;
    let splitMsg = '';

    const pkg = await Package
      .find({
        where: { customer_id: customerId, id: splitPackid },
      });

    if (pkg) {
      splitMsg = req.body.message2;
    }

    await Package.update(
      { status: 'split', splitting_directions: splitMsg },
      { where: { id: splitPackid } },
    );

    await updateState({
      nextStateId: SPLIT_PACKAGE,
      pkg: { id: splitPackid },
      actingUser: req.user,
      comments: 'Split Package requested',
      next,
    });

    return res.status(201)
      .json({
        message: 'Your Split Package request has been submitted to shoppre team.',
      });
  } catch (err) {
    return next(err);
  }
};

exports.abandon = async (req, res, next) => {
  try {
    const abandonPackid = req.params.id;
    log('abandon', abandonPackid);

    await Package.update(
      { status: 'abandon' },
      { where: { id: abandonPackid } },
    );

    await updateState({
      nextStateId: DISCARD_REQUESTED,
      pkg: { id: abandonPackid },
      actingUser: req.user,
      comments: 'Abandon Package requested',
      next,
    });

    return res.status(201).json({
      message: 'All items in your package has been discarded as per your request.' +
        ' You can no longer retrieve the items in your package.',
    });
  } catch (err) {
    return next(err);
  }
};
