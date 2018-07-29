const request = require('supertest');
const app = require('../../../app');

describe('GET /api/shippingPartners/:slug/shipments', () => {
  it('will return shipments related to a shipping partner', (done) => {
    request(app)
      .get('/api/shippingPartners/dhl/shipments')
      .expect('Content-Type', /json/)
      .expect(404)
      .then(() => {
        done();
      });
  });
});

describe('GET /api/shippingPartners/:slug/shipments/:id', () => {
  it('will return ashipment related to a shipping partner', (done) => {
    request(app)
      .get('/api/shippingPartners/dhl/shipments/1')
      .expect('Content-Type', /json/)
      .expect(404)
      .then(() => {
        done();
      });
  });
});
