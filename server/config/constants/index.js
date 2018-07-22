const constants = {
  GROUPS: {
    OPS: 1,
    CUSTOMER: 2,
    FINANCE: 3,
    BOT: 4,
    SHIPPING: 5,
  },
  CONSIGNMENT_TYPES: {
    DOC: '1',
    NONDOC: '2',
  },
  PACKAGE_STATES: {
    ORDER_CREATED: 'order_created',
    ORDER_CANCELLED: 'order_cancelled',
    PAYMENT_INITIATED: 'payment_initiated',
    PAYMENT_FAILED: 'payment_failed',
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
    PAYMENT_CONFIRMED: 22,
  },
  SHIPMENT_COUPON_STATES: {
    PENDING: 'pending',
    SUCCESS: 'success',
  },
  SHIPMENT_STATES: {
    INREVIEW: 'inreview',
    INQUEUE: 'inqueue',
    CANCELED: 'cancelled',
    CONFIRMATION: 'confirmation',
    DISPATCHED: 'dispatched',
    INTRANSIT: 'intransit',
    CUSTOM_HOLD: 'custom_hold',
    LOST: 'lost',
    DELIVERED: 'delivered',
    DAMAGED: 'damaged',
    WRONG_DELIVERY: 'wrong_delivery',
    PAYMENT_CONFIRMED: 'payment_confirmed',
    SHIPMENT_DELIVERED: 'Shipment_delivered',
    SHIPMENT_CANCELLED: 'shipment_cancelled',
    SHIPMENT_HANDED: 'shipment handed',
  },
  SHIPMENT_STATE_IDS: {
    INREVIEW: 16,
    INQUEUE: 2,
    CANCELED: 3,
    CONFIRMATION: 4,
    DISPATCHED: 5,
    INTRANSIT: 6,
    CUSTOM_HOLD: 7,
    LOST: 8,
    DELIVERED: 9,
    DAMAGED: 10,
    WRONG_DELIVERY: 11,
    PAYMENT_CONFIRMED: 22,
    SHIPMENT_DELIVERED: 40,
    SHIPMENT_CANCELLED: 41,
    SHIPMENT_HANDED: 24,
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
    REWARD: '1',
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
  OBJECT_TYPES: {
    PACKAGE: 1,
    SHIPMENT: 2,
  },
  STATE_TYPES: {
    PACKAGE: 1,
    SHIPMENT: 2,
  },
};

constants.PACKAGE_STATE_ID_NAMES = Object
  .keys(constants.PACKAGE_STATE_IDS)
  .reduce((nxt, key) => ({ ...nxt, [constants.SHIPMENT_STATE_IDS[key]]: key }), {});

constants.SHIPMENT_STATE_ID_NAMES = Object
  .keys(constants.SHIPMENT_STATE_IDS)
  .reduce((nxt, key) => ({ ...nxt, [constants.SHIPMENT_STATE_IDS[key]]: key }), {});

module.exports = constants;
