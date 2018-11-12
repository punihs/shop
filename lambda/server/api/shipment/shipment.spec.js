const request = require('supertest');
const app = require('./../../app');
const { WRONG_ADDRESS } = require('./emails/state-change/state-change.data');

describe('POST /api/shipments/notifications', () => {
  it('send Shipment emails', (done) => {
    request(app)
      .post('/api/shipments/notifications')
      .send({
        before: null,
        after: 1,
        object: 'shipment',
        event: 'stateChange',
        ...WRONG_ADDRESS,
      })
      .expect(200)
      .then(() => {
        done();
      });
  });
});
