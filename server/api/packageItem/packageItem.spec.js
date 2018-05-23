const request = require('supertest');
const app = require('./../../app');
const auth = require('../../../logs/credentials');
const opsAuth = require('../../../logs/ops-credentials');

describe('GET /api/packageItem', () => {
  it('return packageItem', (done) => {
    request(app)
      .get('/api/packageItems')
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('GET /api/packageItems/:id', () => {
  it('get packageItem 12', (done) => {
    request(app)
      .get('/api/packageItems/12')
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});


describe('POST /api/packageItem', () => {
  it('save packageItem', (done) => {
    setTimeout(() => {
      request(app)
        .post('/api/packageItems')
        .send({
          name: 'saree',
          package_id: 1,
          package_item_category_id: 29,
          quantity: 1,
          price_amount: 200,
          confirmed_by: 1,
          photo_file: {
            filename: 'x.txt',
            base64: 'aGVsbG8=',
          },
        })
        .set('Authorization', `Bearer ${opsAuth.access_token}`)
        .expect('Content-Type', /json/)
        .expect(201)
        .then(() => {
          done();
        });
    }, 1000);
  });
});

