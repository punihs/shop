const request = require('supertest');
const app = require('./../../app');
const auth = require('../../../logs/credentials');
const opsAuth = require('../../../logs/ops-credentials');


describe('GET /api/packageItemCategory', () => {
  it('return packageItemCategory', (done) => {
    request(app)
      .get('/api/packageItemCategories')
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('POST /api/packageItemCategories', () => {
  it('save  packageItemCategory', (done) => {
    request(app)
      .post('/api/packageItemCategories')
      .send({
        name: 'punith',
      })
      .set('Authorization', `Bearer ${opsAuth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('delete /api/packageItemCategories/1', () => {
  it('delete  packageItemCategory', (done) => {
    request(app)
      .delete('/api/packageItemCategories/1')
      .set('Authorization', `Bearer ${opsAuth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});
