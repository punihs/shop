const { updateState } = require('./../package.service');
const debug = require('debug');
const { stringify } = require('querystring');

const { URLS_PARCEL } = require('./../../../config/environment');
const db = require('./../../../conn/sqldb');

const {
  PACKAGE_STATE_IDS: { PAYMENT_COMPLETED, PAYMENT_FAILED },
  PAYMENT_GATEWAY: { RAZOR },
}
= require('../../../config/constants');

const {
  Package, User, PackageItem,
} = db;

const log = debug('personal shopper');

exports.payResponse = async (req, res, next) => {
  try {
    const failedURL = `${URLS_PARCEL}/personalShopper/index`;
    const sucessURL = `${URLS_PARCEL}/personalShopper/transactions/response`;
    const { status } = req.query;
    const msg = {
      1: 'Looks like you cancelled the payment. You can try again now or if you ' +
      'faced any issues in completing the payment, please contact us.',
      2: 'Security Error! Please try again after sometime or contact us for support.',
      3: 'Payment transaction failed! You can try again now or if you faced any issues in ' +
      'completing the payment, please contact us.',
      4: 'Unexpected error occurred and payment has been failed',
      5: 'invalid payment gateway',
      6: 'success',
    }[status];

    const objectId = req.params.id;

    const customer = await User.findById(req.query.uid, { raw: true });

    const SUCCESS = '6';
    log(req.query.status);
    log(req.query);

    const ids = objectId.split(',');
    const pkg = await Package.findAll({
      where: { id: ids },
      include: [{
        model: PackageItem,
        attributes: ['id', 'name', 'price_amount', 'quantity', 'total_amount', 'url', 'status'],
      }],
    });

    if (req.query.status === SUCCESS) {
      await Package.update({
        transaction_id: req.query.transaction_id,
      }, { where: { id: objectId.split(',') } });

      pkg.forEach((x) => {
        updateState({
          lastStateId: null,
          nextStateId: PAYMENT_COMPLETED,
          pkg: x,
          actingUser: customer,
          next,
        });
      });

      const { amount } = req.query;
      const params = {
        object_id: req.query.object_id,
        customer_id: req.query.uid,
        status: 'sucess',
        message: msg,
        amount,
      };

      if (RAZOR === Number(req.query.pg)) {
        res.json(`${sucessURL}?${stringify(params)}`);
      } else {
        res.redirect(`${sucessURL}?${stringify(params)}`);
      }
    } else {
      pkg.forEach((x) => {
        updateState({
          lastStateId: null,
          nextStateId: PAYMENT_FAILED,
          pkg: x,
          actingUser: customer,
          next,
        });
      });

      if (RAZOR === Number(req.query.pg)) {
        res.json(`${failedURL}?error='failed'&message=${msg}`);
      } else {
        res.redirect(`${failedURL}?error='failed'&message=${msg}`);
      }
    }
  } catch (err) {
    next(err);
  }
};
