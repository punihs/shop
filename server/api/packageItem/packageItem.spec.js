const request = require('supertest');
const app = require('./../../app');
const { Package } = require('../../conn/sqldb');
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
  before(async () => {
    await Package.create({});
  });

  it('save packageItem', (done) => {
    request(app)
      .post('/api/packageItems')
      .send({
        name: 'kurtha2',
        package_id: 1,
        package_item_category_id: 9,
        quantity: 1,
        price_amount: 200,
        confirmed_by: 1,
        photo_file: {
          filename: 'x.jpg',
          base64: 'aGVsbG8=',
        },
      })
      .set('Authorization', `Bearer ${opsAuth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(201)
      .then(() => {
        done();
      });
  });
});

describe('PUT /api/packageItem update meta', () => {
  it('PUT packageItem', (done) => {
    request(app)
      .put('/api/packageItems/1/meta')
      .send({
        name: 'mobile',
        package_item_category_id: 7,
        quantity: 2,
        price_amount: 3000,
      })
      .set('Authorization', `Bearer ${opsAuth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('Destroy /api/packageItem update meta', () => {
  it('Destroy destroy packageItem', (done) => {
    request(app)
      .delete('/api/packageItems/1')
      .set('Authorization', `Bearer ${opsAuth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('PUT /api/packageItem update image to null', () => {
  it('PUT packageItem/2/image', (done) => {
    request(app)
      .put('/api/packageItems/2/image')
      .set('Authorization', `Bearer ${opsAuth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});
