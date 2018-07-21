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

describe('GET /api/shippingPartners/partners?type=dhl', () => {
  it('return shippingPartners/partners?type=dhl', (done) => {
    request(app)
      .get('/api/shippingPartners/partners?type=dhl')
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
