const request = require('supertest');
const app = require('./../../../lambda/app');
const { PACKAGE_ITEMS_UPLOAD_PENDING } = require('./emails/state-change/state-change.data');

describe('POST /api/packages/notifications', () => {
  it('send emails', (done) => {
    request(app)
      .post('/api/packages/notifications')
      .send({
        before: null,
        after: 1,
        object: 'package',
        event: 'stateChange',
        ...PACKAGE_ITEMS_UPLOAD_PENDING,
      })
      .expect(200)
      .then(() => {
        done();
      });
  });
});
