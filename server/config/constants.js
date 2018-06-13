module.exports = {
  GROUPS: {
    OPS: 1,
    CUSTOMER: 2,
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
};
