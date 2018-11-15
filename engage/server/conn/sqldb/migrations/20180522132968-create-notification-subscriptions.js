
const {
  engine, timestamps, keys, properties, id,
} = require('../helper.js');

module.exports = {
  up: (queryInterface, DataTypes) => queryInterface
    .createTable('notification_subscriptions', {
      id,
      ...properties('notificationSubscription', DataTypes),
      user_id: keys('users'),
      ...timestamps(2, DataTypes),
    }, engine),
  down(queryInterface) {
    return queryInterface.dropTable('notification_subscriptions');
  },
};
