
angular.module('uiGenApp')
  .factory('QCONFIG', () => ({
    PACKAGE_STATES: ['TASKS', 'FEEDBACK', 'COMPLETED', 'ALL'],
    USER_GROUPS: [{ id: 1, name: 'ADMINS' }, { id: 2, name: 'CUSTOMERS' }],
    MANAGE_JD_STATES: ['New', 'Accepted', 'Hidden', 'Rejected', 'ALL'],
    SHIPMENT_STATES: ['IN_REVIEW', 'IN_QUEUE', 'SENT', 'ALL'],
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
    },

    CARTON_BOX: [
      { amount: 14.5, kg: '2.5 - kg' },
      { amount: 23, kg: '5.5 - kg' },
      { amount: 35, kg: '10.5 - kg' },
      { amount: 40.5, kg: '15.5 - kg' },
      { amount: 58.5, kg: '17.5 - kg' },
      { amount: 10, kg: 'Other' },
    ],
  }));

