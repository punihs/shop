const rp = require('request-promise');
const { NotificationSubscription } = require('../sqldb');

const sendCore = ({ playerIds, msg }) => {
  const options = {
    method: 'POST',
    headers: {
      Authorization: 'Basic NDA5OTgwMGEtMmFhMS00NzY5LWIxZTEtYjA0ODMzYmE3ZjM5',
    },

    uri: 'https://onesignal.com/api/v1/notifications',
    json: true,
    body: {
      // https://documentation.onesignal.com/v5.0/reference#section-appearance
      app_id: 'b7792635-0674-4e60-bef9-66d31b818a92',
      headings: { en: msg.title },
      contents: { en: msg.body },
      include_player_ids: playerIds,
      data: {
        abc: '123',
      },
      // url which opens when user clicks on notification
      url: msg.link,
    },
  };

  return rp
    .post(options)
    .catch(err => err);
};

module.exports = {
  send({ userId, msg }) {
    return NotificationSubscription
      .findAll({
        attributes: ['player_id'],
        where: {
          user_id: userId,
        },
        raw: true,
      })
      .then(notificationSubscriptions => sendCore({
        playerIds: notificationSubscriptions
          .map(({ player_id: playerId }) => playerId),
        msg,
      }));
  },
  sendCore,
};
