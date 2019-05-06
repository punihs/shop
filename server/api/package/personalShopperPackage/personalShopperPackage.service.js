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


const getPackages = async (ids) => {
  const pkg = await Package.findAll({
    where: { id: ids },
    include: [{
      model: PackageItem,
      attributes: ['id', 'name', 'price_amount', 'quantity', 'total_amount', 'url', 'status'],
    }],
  });
  return pkg;
};

exports.payResponse = async (req, res, next) => {
  try {
    // const failedURL = `${URLS_PARCEL}/personalShopper/index`;
    // const sucessURL = `${URLS_PARCEL}/personalShopper/transactions/response`;
    // const { status } = req.query;
    // const msg = {
    //   1: 'Looks like you cancelled the payment. You can try again now or if you ' +
    //   'faced any issues in completing the payment, please contact us.',
    //   2: 'Security Error! Please try again after sometime or contact us for support.',
    //   3: 'Payment transaction failed! You can try again now or if you faced any issues in ' +
    //   'completing the payment, please contact us.',
    //   4: 'Unexpected error occurred and payment has been failed',
    //   5: 'invalid payment gateway',
    //   6: 'success',
    // }[status];
    const { body } = req;

    console.log('Body', body);

    const objectId = body.id;

    const customer = await User.findById(body.customer_id, { raw: true });

    const SUCCESS = '6';
    log(body.status);
    log(body.query);

    const ids = objectId.toString().includes(',') === true ? objectId.split(',') : objectId;

    await Package.update({
      transaction_id: body.transaction_id,
    }, { where: { id: ids } });

    if (body.status === SUCCESS) {
      const pkg = await getPackages(ids);

      pkg.forEach((x) => {
        updateState({
          lastStateId: null,
          nextStateId: PAYMENT_COMPLETED,
          pkg: x,
          actingUser: customer,
          next,
        });
      });
    } else {
      const pkg = await getPackages(ids);

      pkg.forEach((x) => {
        updateState({
          lastStateId: null,
          nextStateId: PAYMENT_FAILED,
          pkg: x,
          actingUser: customer,
          next,
        });
      });
    }
    return res.status(200).json({ status: 'updated' });
  } catch (err) {
    next(err);
  }
};
