
const {
  engine, timestamps, properties,
} = require('../helper.js');

module.exports = {
  up: (queryInterface, DataTypes) => queryInterface
    .createTable('schedule_pickups', Object
      .assign(properties('schedulePickup', DataTypes), {
      }, timestamps(3, DataTypes)), engine),
  down(queryInterface) {
    return queryInterface.dropTable('schedule_pickups');
  },
};
