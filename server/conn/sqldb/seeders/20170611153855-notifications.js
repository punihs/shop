module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('notifications', [{
      id: 1,
      action_type: 'Customer',
    }, {
      id: 2,
      action_type: 'Incoming',
    }, {
      id: 3,
      action_type: 'Package',
    }, {
      id: 4,
      action_type: 'Shipment',
    }, {
      id: 5,
      action_type: 'Shopper',
    }, {
      id: 6,
      action_type: 'SelfShopper',
    }, {
      id: 7,
      action_type: 'StatusChange',
    },
    ], {});
  },

  down(queryInterface) {
    return queryInterface.bulkDelete('notifications', { id: [1, 2] });
  },
};
