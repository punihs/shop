
exports.orderCreate = {
  title: 'Package',
  type: 'object',
  properties: {
    name: {
      type: 'string',
      maxLength: 100,
    },
    email: {
      type: 'number',
    },
  },
  required: ['store_id'],
};
