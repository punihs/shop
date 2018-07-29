const request = require('supertest');
const app = require('./../../app');

// describe('GET /api/shippingPartners', () => {
//   it('return shippingPartners', (done) => {
//     request(app)
//       .get('/api/shippingPartners')
//       .expect('Content-Type', /json/)
//       .expect(200)
//       .then(() => {
//         done();
//       });
//   });
// });

describe('GET /api/shippingPartners/partner/dhl', () => {
  it('return shippingPartners/partner/dhl', (done) => {
    request(app)
      .get('/api/shippingPartners/partner/dhl')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('GET /api/shippingPartners/partners/dhl/detail/11', () => {
  it('return shippingPartners/partner/dhl/detail/11', (done) => {
    request(app)
      .get('/api/shippingPartners/partner/dhl/detail/11')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

// describe('GET /api/shippingPartners/show', () => {
//   it('return shippingPartners/dhl', (done) => {
//     request(app)
//       .get('/api/shippingPartners/dhl')
//       .expect('Content-Type', /json/)
//       .expect(200)
//       .then(() => {
//         done();
//       });
//   });
// });
