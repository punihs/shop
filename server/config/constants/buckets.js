
const { GROUPS: { OPS, CUSTOMER, FINANCE } } = require('./index');

module.exports = {
  [OPS]: {
    TASKS: [
      1, 2, 4, 7, 9, 11,
    ],
    FEEDBACK: [
      3, 5, 6, 8,
    ],
    COMPLETED: [
      10, 13,
    ],
    ALL: [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
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
      8,
    ],
    COMPLETED: [
      10,
    ],
  },
};
