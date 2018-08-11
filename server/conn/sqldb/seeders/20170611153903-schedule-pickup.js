const { schedulePickup } = require('../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('schedule_pickups', schedulePickup, {});
  },

  down(queryInterface) {
    return queryInterface.bulkDelete('schedule_pickups', { id: [1] });
  },
};
