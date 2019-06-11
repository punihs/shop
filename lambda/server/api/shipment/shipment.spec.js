const request = require('supertest');
const app = require('./../../app');
const { PAYMENT_REQUESTED } = require('./emails/state-change/state-change.data');

describe('POST /api/shipments/notifications', () => {
  it('send Shipment emails', (done) => {
    request(app)
      .post('/api/shipments/notifications')
      .send({
        before: null,
        after: 1,
        object: 'shipment',
        event: 'stateChange',
        ...PAYMENT_REQUESTED,
      })
      .expect(200)
      .then(() => {
        done();
      });
  });
});
