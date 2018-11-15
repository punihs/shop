const onesignal = require('./');
const { PREFIX, DOMAIN } = require('../../config/environment');

const subscribedUsers = {
  ABHINAV: 646,
};

describe('POST /api/packages/notifications', () => {
  it('send Push Notification', (done) => {
    onesignal.send({
      userId: subscribedUsers.ABHINAV,
      msg: {
        title: 'Amazon package recieved',
        body: 'just now',
        link: `${PREFIX}member.${DOMAIN}/locker?bucket=IN_REVIEW`,
      },
    }).then(() => done());
  });
});
