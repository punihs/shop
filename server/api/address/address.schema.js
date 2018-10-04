const createAddress = {
  title: 'Address',
  type: 'object',
  properties: {
    first_name: {
      type: 'string',
    },
  },
  required: [
    'salutation', 'first_name', 'last_name', 'line1', 'line2', 'city', 'state', 'country_id',
    'pincode', 'phone',
  ],
};

exports.createAddress = createAddress;
