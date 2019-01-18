
const {
  GROUPS: {
    OPS, CUSTOMER, FINANCE,
  },
} = require('./index');

module.exports = {
  PACKAGE: {
    [OPS]: {
      TASKS: [
        1, 2, 4, 6, 7, 9, 11, 12, 15, 52, 53, 59, 29,
      ],
      FEEDBACK: [
        3, 5, 8, 54,
      ],
      COMPLETED: [
        8, 10, 13, 14, 28,
      ],
      ALL: [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 52, 53, 54, 59,
      ],
    },
    [CUSTOMER]: {
      READY_TO_SEND: [
        5,
      ],
      IN_REVIEW: [
        1, 2, 4, 6, 12, 52, 53, 15, 11, 29,
      ],
      ACTION_REQUIRED: [ // - === TASKS
        3, 54,
      ],
      MY_ORDERS: [
        59,
      ],
      ALL: [
        42, 43, 44, 45, 46, 47, 48, 1, 2, 3, 4, 5, 6, 7, 9,
        10, 11, 12, 52, 53, 54, 59, 15,
      ],
    },
    [FINANCE]: {
      TASKS: [
        8,
      ],
      COMPLETED: [
        10,
      ],
    },
  },
  SHIPMENT: {
    [OPS]: {
      IN_REVIEW: [
        16, 15, 20, 22, 23, 25, 26, 27,
      ],
      IN_QUEUE: [
        17, 18, 19, 21,
      ],
      SENT: [
        24, 25, 27, 28, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 60,
      ],
      ALL: [
        16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28,
        29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 55, 60,
      ],
    },
    [CUSTOMER]: {
      IN_QUEUE: [
        1, 2,
      ],
      TASKS: [
        3, 5, 6,
      ],
      VIEW_ALL: [
        1, 2, 3, 4, 5, 6,
      ],
      IN_REVIEW: [
        1, 2,
      ],
      ACTION_REQUIRED: [
        3,
      ],
      READY_TO_SEND: [
        3,
      ],
    },
    [FINANCE]: {
      TASKS: [
        4, 9,
      ],
      COMPLETED: [
        10,
      ],
    },
  },
  ORDER: {
    [OPS]: {
      TASKS: [
        46, 64, 43,
      ],
      FEEDBACK: [
        48, 49, 65, 66, 45, 63, 42,
      ],
      COMPLETED: [
        50, 51, 62,
      ],
      ALL: [
        42, 46, 48, 49, 65, 66, 45, 63, 43, 50, 51, 62,
      ],
    },
    [CUSTOMER]: {
      TASKS: [
        3, 5, 6,
      ],
      VIEW_ALL: [
        1, 2, 3, 4, 5, 6,
      ],
      IN_REVIEW: [
        1, 2,
      ],
      ACTION_REQUIRED: [
        3,
      ],
      READY_TO_SEND: [
        3,
      ],
    },
    [FINANCE]: {
      TASKS: [
        4, 9,
      ],
      COMPLETED: [
        10,
      ],
    },
  },
};
