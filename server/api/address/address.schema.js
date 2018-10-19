const createAddress = {
  title: 'Address',
  type: 'object',
  properties: {
    first_name: {
      type: 'string',
    },
  },
  required: [
    'salutation', 'first_name', 'last_name', 'line1', 'city', 'state', 'country_id',
    'phone',
  ],
};

exports.createAddress = createAddress;
