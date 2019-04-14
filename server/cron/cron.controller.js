const schedule = require('node-schedule');

const logger = require('./../components/logger');
const { paymentSubmitDelayExceededEmail, paymentSubmitDelayEmail } = require('./../../server/api/shipment/shipment.service');
const { packageStorageExceededEmail, packageStorageEmail } = require('./../../server/api/package/package.service');
const shipmentHookshot = require('./shipment.cron.hookshot');
const packageHookshot = require('./package.cron.hookshot');
const transactionCtrl = require('../api/transaction/transaction.controller');

const {
  SUPPORT_EMAIL_ID, SUPPORT_EMAIL_FIRST_NAME, SUPPORT_EMAIL_LAST_NAME,
} = require('./../config/environment');

const {
  SHIPMENT_STATE_IDS: { PAYMENT_DELAY_EXCEEDED, PAYMENT_DELAY },
  PACKAGE_STATE_IDS: { PACKAGE_STORAGE, PACKAGE_STORAGE_EXCEEDED },
} = require('./../config/constants/');

const {
  PACKAGE: { PACKAGE_STORAGE_EXCEEDED_CHARGE },
  SHIPMENT: { PAYMENT_DELAY_EXCEEDED_CHARGE },
} = require('./../config/constants/charges');

const {
  PACKAGE_STORAGE_NUMBER_OF_DAYS, PAYMENT_SUBMIT_NUMBER_OF_DAYS,
} = require('./../config/constants/options');

const paymentGateway = {
  name: null,
};

const opsUser = {
  first_name: SUPPORT_EMAIL_FIRST_NAME,
  last_name: SUPPORT_EMAIL_LAST_NAME,
  email: SUPPORT_EMAIL_ID,
};

schedule.scheduleJob(' 0 1 * * *', async () => {
  this.shipmentCron();
  this.packageCron();
});

exports.shipmentCron = async () => {
  let nextStateId = PAYMENT_DELAY_EXCEEDED;
  const shipmentDelayExceeded = await paymentSubmitDelayExceededEmail();
  if (shipmentDelayExceeded) {
    shipmentDelayExceeded.forEach((x) => {
      shipmentHookshot
        .stateChange({
          nextStateId,
          lastStateId: null,
          shipment: x,
          actingUser: opsUser,
          packages: [],
          gateway: null,
          paymentGateway,
          address: null,
          paymentDelayCharge: PAYMENT_DELAY_EXCEEDED_CHARGE,
          paymentDelayLimit: PAYMENT_SUBMIT_NUMBER_OF_DAYS,
        })
        .catch(err => logger.error('statechange notification', nextStateId, shipmentDelayExceeded, err));

      transactionCtrl
        .setWallet({
          customer_id: x.customer_id,
          amount: -PAYMENT_DELAY_EXCEEDED_CHARGE,
          description: `Payment delay charge for Shipment id ${x.id}`,
        });
    });
  }

  nextStateId = PAYMENT_DELAY;
  const shipmentDelay = await paymentSubmitDelayEmail();
  if (shipmentDelay) {
    shipmentDelay.forEach((x) => {
      shipmentHookshot
        .stateChange({
          nextStateId,
          lastStateId: null,
          shipment: x,
          actingUser: opsUser,
          packages: [],
          gateway: null,
          paymentGateway,
          address: null,
          paymentDelayCharge: PAYMENT_DELAY_EXCEEDED_CHARGE,
          paymentDelayLimit: PAYMENT_SUBMIT_NUMBER_OF_DAYS,
        })
        .catch(err => logger.error('statechange notification', nextStateId, shipmentDelay, err));
    });
  }
};

exports.shipment = async (req, res, next) => {
  try {
    const result = await this.shipmentCron();
    return res.json(result);
  } catch (err) {
    return next(err);
  }
};

exports.packageCron = async () => {
  let nextStateId = PACKAGE_STORAGE_EXCEEDED;
  const packageStorageExceeded = await packageStorageExceededEmail();

  if (packageStorageExceeded) {
    packageStorageExceeded.forEach((x) => {
      packageHookshot
        .stateChange({
          nextStateId,
          lastStateId: null,
          actingUser: opsUser,
          pkg: x,
          gateway: null,
          paymentGateway,
          packageStorageLimit: PACKAGE_STORAGE_NUMBER_OF_DAYS,
          packageStorageExceededCharge: PACKAGE_STORAGE_EXCEEDED_CHARGE,
        })
        .catch(err => logger.error('statechange notification', nextStateId, packageStorageExceeded, err));
    });
  }

  nextStateId = PACKAGE_STORAGE;
  const packageStorage = await packageStorageEmail();

  if (packageStorage) {
    packageStorage.forEach((x) => {
      packageHookshot
        .stateChange({
          nextStateId,
          lastStateId: null,
          actingUser: opsUser,
          pkg: x,
          gateway: null,
          paymentGateway,
          packageStorageLimit: PACKAGE_STORAGE_NUMBER_OF_DAYS,
          packageStorageExceededCharge: PACKAGE_STORAGE_EXCEEDED_CHARGE,
        })
        .catch(err => logger.error('statechange notification', nextStateId, packageStorage, err));
    });
  }
};


exports.package = async (req, res, next) => {
  try {
    const result = await this.packageCron();
    return res.json(result);
  } catch (err) {
    return next(err);
  }
};
