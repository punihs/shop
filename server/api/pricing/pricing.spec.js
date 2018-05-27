const request = require('supertest');
const assert = require('assert');

const app = require('../../app');

describe('GET /api/pricing', () => {
  it('respond with list of prices', (done) => {
    request(app)
      .get('/api/pricing?all=true&country=US&type=doc&weight=0.5')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('GET /api/pricing/expressive', () => {
  it('respond with list of prices', (done) => {
    request(app)
      .get('/api/pricing/expressive')
      .query({
        query: 'price',
        country: 'usa',
        type: 'doc',
        service: 'courier',
        shippingPartner: 'dhl',
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        assert(res.body.q === 'how much it cost to send courier to usa through dhl for Document');
        assert(res.body.a === 'with dhl for Document: Rs.500\nfor Other than document: Rs.300\n');
        done();
      });
  });
});
