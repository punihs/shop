const constants = {
  GROUPS: {
    OPS: 1,
    CUSTOMER: 2,
    FINANCE: 3,
  },
  CONSIGNMENT_TYPES: {
    DOC: '1',
    NONDOC: '2',
  },
  PACKAGE_STATES: {
    PROCESSING: 'processing',
    VALUES: 'values',
    REVIEW: 'review',
    DELIVERED: 'delivered',
    SHIP: 'ship',
    INREVIEW: 'inreview',
    RETURN: 'return',
    RETURN_DONE: 'return_done',
    SPLIT: 'split',
    ABANDON: 'abandon',
  },
  PACKAGE_STATE_IDS: {
    CREATED: 1,
    PROCESSING: 1,
    VALUES: 2,
    REVIEW: 3,
    DELIVERED: 4,
    SHIP: 5,
    INREVIEW: 6,
  },
  SHIPMENT_COUPON_STATES: {
    PENDING: 'pending',
    SUCCESS: 'success',
  },
  SHIPMENT_STATES: {
    REQUESTED: 'requested',
    INQUEUE: 'inqueue',
    INREVIEW: 'inreview',
    DISPATCHED: 'dispatched',
    DELIVERED: 'delivered',
    CANCELED: 'canceled',
    CONFIRMATION: 'confirmation',
  },
  SHIPMENT_STATE_IDS: {
    REQUESTED: 1,
    INQUEUE: 2,
    INREVIEW: 3,
    DISPATCHED: 4,
    DELIVERED: 5,
    CANCELED: 6,
  },
  PRICE_ENTERER: {
    SHOPPRE: '1',
    CUSTOMER: '2',
  },
  PHOTO_REQUEST_TYPES: {
    BASIC: '1',
    ADVANCED: '2',
  },
  PHOTO_REQUEST_STATES: {
    PENDING: '1',
    COMPLETED: '2',
  },
  TRANSACTION_TYPES: {
    CREDIT: '1',
    DEBIT: '2',
  },
  APPS: {
    ACCOUNTS: 1,
    OPS: 2,
    MEMBER: 3,
    WWW: 4,
  },
  SALUTATIONS: {
    MR: 'Mr',
    MS: 'Ms',
    MRS: 'Mrs',
  },
  LOYALTY_TYPE: {
    CREDIT: '1',
    REDEEM: '2',
  },
  PAYMENT_GATEWAY: {
    PAYTM: 1,
    WIRE: 2,
    CREDITDEBITCARD: 3,
    PAYPAL: 4,
    WALLET: 5,
    CASH: 6,
  },
  CONTENT_TYPES: {
    REGULAR: '1',
    SPECIAL: '2', // 'Liquid, Cream, Oil & Home-made food items'
  },
  PACKAGE_CHARGES: {
    RETURN_CHARGE: 400,
    BASIC_PHOTO: 50.00,
    ADVANCED_PHOTO: 300,
  },
  FOLLOWER_TYPES: {
    PACKAGE: 1,
    SHIPMENT: 2,
    ORDER: 3,
  },
};

constants.PACKAGE_STATE_ID_NAMES = Object
  .keys(constants.PACKAGE_STATE_IDS)
  .reduce((nxt, key) => ({ ...nxt, [constants.PACKAGE_STATE_IDS[key]]: key }), {});

module.exports = constants;
