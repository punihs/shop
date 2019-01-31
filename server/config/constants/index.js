const constants = {

  GROUPS: {
    OPS: 1,
    CUSTOMER: 2,
    FINANCE: 3,
    BOT: 4,
    SHIPPING: 5,
  },
  ROLES: {
    CEO: 1,
    RECEPTION: 2,
    PACKAGE_VERIFIER: 3,
    STORAGE: 4,
    PACKAGER: 5,
  },
  CONSIGNMENT_TYPES: {
    DOC: '1',
    NONDOC: '2',
  },
  PACKAGE_STATE_IDS: {
    PACKAGE_ITEMS_UPLOAD_PENDING: 1,
    AWAITING_VERIFICATION: 2,
    CUSTOMER_INPUT: 3,
    IN_REVIEW: 4,
    READY_TO_SHIP: 5,
    DAMAGED: 6,
    RETURN_REQUEST_FROM_CUSTOMER: 7,
    RETURN_PICKUP_DONE: 8,
    PS_RETURN_REQUESTED: 9,
    PS_REFUND_RECIEVED: 10,
    SPLIT_PACKAGE: 11,
    SPLIT_PACKAGE_PROCESSED: 12,
    DISCARDED: 13,
    ADDED_SHIPMENT: 14,
    DISCARD_REQUESTED: 15,
    STANDARD_PHOTO_REQUEST: 52,
    ADVANCED_PHOTO_REQUEST: 53,
    ORDER_CREATED: 42,
    ORDER_CANCELLED: 43,
    PAYMENT_INITIATED: 44,
    PAYMENT_FAILED: 45,
    PAYMENT_COMPLETED: 46,
    ORDER_PLACED: 48,
    OUT_OF_STOCK: 49,
    REFUNDED_TO_WALLET: 50,
    REFUNDED_TO_BANK_ACCOUNT: 51,
    AWAITING_PACKAGE: 47,
    UPLOAD_INVOICE_REQUESTED: 54,
    INCOMING_PACKAGE: 59,
    ORDER_DELETED: 62,
    PAYMENT_CONFIRMED: 63,
    ORDER_PROCEED: 64,
    PRICE_CHANGED: 65,
    IN_TRANSIT: 66,
    AWAITING_FOR_STOCK: 67,
    ORDER_COMPLETED: 68,
    OTHER_ITEMS_PROCEED: 69,
  },
  SHIPMENT_COUPON_STATES: {
    PENDING: 'pending',
    SUCCESS: 'success',
  },
  SHIPMENT_STATE_IDS: {
    PACKAGING_REQUESTED: 16,
    INVOICE_REQUESTED: 17,
    PAYMENT_REQUESTED: 18,
    PAYMENT_INITIATED: 19,
    PAYMENT_COMPLETED: 20,
    PAYMENT_FAILED: 21,
    PAYMENT_CONFIRMED: 22,
    UPSTREAM_SHIPMENT_REQUEST_CREATED: 23,
    SHIPMENT_HANDED: 24,
    SHIPMENT_IN_TRANSIT: 25,
    SHIPMENT_MANUAL_FOLLOW_UP: 26,
    SHIPMENT_LOST: 27,
    CUSTOM_ON_HOLD: 28,
    WRONG_ADDRESS: 29,
    SHIPMENT_REJECTED_BY_CUSTOMER: 30,
    RTO_REQUESTED: 31,
    RAISE_SHIPMENT_LOST_CLAIM: 32,
    PENALTY_PAYMENT_REQUESTED: 33,
    RETURN_TO_ORIGIN: 34,
    AMOUNT_RECEIVED_FROM_UPSTREAM: 35,
    PENALTY_PAYMENT_DONE: 36,
    WRONG_ADDRESS_FOLLOW_UP: 37,
    CLAIM_PROCESSED_TO_CUSTOMER: 38,
    CUSTOMER_ACKNOWLEDGEMENT_RECEIVED: 39,
    SHIPMENT_DELIVERED: 40,
    SHIPMENT_CANCELLED: 41,
    SHIPMENT_DELETED: 55,
    CUSTOMER_DOCUMENT_RESOLVED: 60,
    SHIPMENT_ABANDON: 61,
  },
  SHIPMENT_HISTORY: [24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 61],
  SHIPMENT_COUNT: [23, 24, 25, 26, 27, 28, 29, 30, 31,
    32, 33, 34, 35, 36, 37, 38, 39, 40],

  PRICE_ENTERER: {
    SHOPPRE: '1',
    CUSTOMER: '2',
  },
  PHOTO_REQUEST_TYPES: {
    STANDARD: '1',
    ADVANCED: '2',
  },
  PHOTO_REQUEST_STATES: {
    PENDING: '1',
    COMPLETED: '2',
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
  CONTENT_TYPES: {
    REGULAR: '1',
    SPECIAL: '2', // 'Liquid, Cream, Oil & Home-made food items'
  },
  OBJECT_TYPES: {
    PACKAGE: 1,
    SHIPMENT: 2,
  },
  STATE_TYPES: {
    PACKAGE: 1,
    SHIPMENT: 2,
  },
  PACKAGE_TYPES: {
    INCOMING: '1',
    COD: '2',
    PERSONAL_SHOPPER: '3',
  },
  RATE_TYPES: {
    FIXED: '1',
    MULTIPLE: '2',
  },
  SHIPPING_PARTNERS_ID: {
    DHL: 1,
    FEDEX: 2,
    DTDC: 3,
  },
  PAYMENT_GATEWAY: {
    WIRE: 1,
    CASH: 2,
    CARD: 3,
    PAYTM: 4,
    PAYPAL: 5,
    WALLET: 6,
    RAZOR: 7,
  },
  PAYMENT_GATEWAY_NAMES: {
    WIRE: 'wire',
    CASH: 'cash',
    CARD: 'card',
    PAYTM: 'paytm',
    PAYPAL: 'paypal',
    WALLET: 'wallet',
    RAZOR: 'razor',
  },
};

constants.PACKAGE_STATE_ID_NAMES_MAP = Object
  .keys(constants.PACKAGE_STATE_IDS)
  .reduce((nxt, stateName) => ({
    ...nxt,
    [constants.PACKAGE_STATE_IDS[stateName]]: stateName,
  }), {});
constants.SHIPMENT_STATE_ID_NAMES_MAP = Object
  .keys(constants.SHIPMENT_STATE_IDS)
  .reduce((nxt, stateName) => ({
    ...nxt,
    [constants.SHIPMENT_STATE_IDS[stateName]]: stateName,
  }), {});

module.exports = constants;
