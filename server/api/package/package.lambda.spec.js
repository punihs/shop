const request = require('supertest');
const app = require('./../../../lambda/app');
const { CREATED } = require('./emails/state-change/state-change.data');

describe('POST /api/packages/notifications', () => {
  it('send emails', (done) => {
    request(app)
      .post('/api/packages/notifications')
      .send({
        before: null,
        after: 1,
        object: 'package',
        event: 'stateChange',
        ...CREATED,
      })
      .expect(200)
      .then(() => {
        done();
      });
  });
});
