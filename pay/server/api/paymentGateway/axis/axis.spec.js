const request = require('supertest');
const app = require('./../../../app');

describe('get /api/axis', () => {
  it('return axis bank ', (done) => {
    request(app)
      .get('/api/axis/')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('get /api/axis/payment', () => {
  it('return axis bank ', (done) => {
    request(app)
      .get('/api/axis/payment')
      .send({
        name: 'meena',
        mobile: 8970972343,
        email: 'punith.hs90@gmail.com',
        amount: 10,
        comment: 'testing payment gateway',
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('get /api/axis/directPaymentInitiate', () => {
  it('return to axis bank direct payment', (done) => {
    request(app)
      .get('/api/axis/directPaymentInitiate')
      .send({
        payment_id: 1,
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('get /api/axis/directPaymentInitiate', () => {
  it('return to axis bank direct payment', (done) => {
    request(app)
      .get('/api/axis/directPaymentInitiate')
      .send({
        payment_id: 32323232323,
      })
      .expect('Content-Type', /json/)
      .expect(400)
      .then(() => {
        done();
      });
  });
});
