const onesignal = require('./');

describe('POST /api/packages/notifications', () => {
  it('send emails', (done) => {
    onesignal.send({
      userId: 647,
      msg: {
        title: 'hello1',
      },
    }).then(() => done());
  });
});
