const rp = require('request-promise');
const { NotificationSubscription } = require('../sqldb');
const config = require('../../config/environment');
const logger = require('../../components/logger');

const ENV = config.PREFIX === 'https://staging-' ? 'staging' : config.env;

const credentials = {
  development: {
    restKey: 'ZGFjODcxZDktMjU5ZS00YzAxLTgwMTUtOTJlZWI4N2Y2ZmI2',
    appId: '91cbfcb8-6ad5-4128-a0f6-a653eeeaac4c',
  },
  staging: {
    restKey: 'NWI4M2FmZTUtMjFkMy00NmYzLWI3NDAtMWJmNWY4YjgyOTIw',
    appId: '98049cea-88e2-49b5-b2a3-d6c5fe0d6dbf',
  },
  production: {
    restKey: 'ODI2MWNmNDktMDY4YS00MzlhLWJkZDItZTM1MGViZDM3ODgx',
    appId: 'd0bf3fb3-1bd7-4ad8-9ba0-85ca0eb1273f',
  },
}[ENV];

const sendCore = ({ playerIds, msg }) => {
  const options = {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials.restKey}`,
    },

    uri: 'https://onesignal.com/api/v1/notifications',
    json: true,
    body: {
      // https://documentation.onesignal.com/v5.0/reference#section-appearance
      app_id: credentials.appId,
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
    .catch(err => logger.error('Notification Error: ', err));
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
