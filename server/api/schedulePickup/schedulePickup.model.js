const properties = require('./schedulePickup.property');

module.exports = (sequelize, DataTypes) => {
  const SchedulePickup = sequelize.define('SchedulePickup', properties(DataTypes), {
    tableName: 'schedule_pickups',
    timestamps: true,
    underscored: true,
  });
  return SchedulePickup;
};
