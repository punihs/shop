const onesignal = require('./');
const { PREFIX, DOMAIN } = require('../../config/environment');

const subscribedUsers = {
  VIKAS: 4,
};

describe('POST /api/packages/notifications', () => {
  it('send Push Notification', (done) => {
    onesignal.send({
      userId: subscribedUsers.VIKAS,
      msg: {
        title: 'Quick Package',
      },
      target: {
        url: `${PREFIX}member.${DOMAIN}/locker?bucket=IN_REVIEW`,
      },
    }).then(() => done());
  });
});
