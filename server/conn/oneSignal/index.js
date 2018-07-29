const OneSignal = require('onesignal-node');
const bluebird = require('bluebird');

const connection = new OneSignal.Client({
  userAuthKey: 'MjlmNmM0MTEtZjAzNS00OTE5LTg2MDctZWRiZjU0MGZlYjkw',
  app: {
    appAuthKey: 'NDA5OTgwMGEtMmFhMS00NzY5LWIxZTEtYjA0ODMzYmE3ZjM5',
    appId: 'b7792635-0674-4e60-bef9-66d31b818a92',
  },
});
bluebird.promisifyAll(Object.getPrototypeOf(connection));

module.exports = {
  connection,
  send({ userId, msg }) {
    const notification = new OneSignal.Notification({
      contents: {
        en: msg.title,
      },
    });

    // - Set the Target users
    notification.setFilters([{
      field: 'tag',
      key: 'userId',
      relation: 'exists',
      value: userId,
    }]);

    // - send this notification to All Users except Inactive ones
    return connection.sendNotificationAsync(notification);
  },
};
