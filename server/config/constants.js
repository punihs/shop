module.exports = {
  SHIPMENT_TYPES: {
    DOC: 1,
    NONDOC: 2,
  },
  ORDER_STATES: {
    PENDING: 'pending',
    RECEIVED: 'received',
  },
  PACKAGE_STATES: {
    PROCESSING: 'processing',
    VALUES: 'values',
    REVIEW: 'review',
    DELIVERED: 'delivered',
    SHIP: 'ship',
    INREVIEW: 'inreview',
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
};
