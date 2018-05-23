const request = require('supertest');
const app = require('./../../app');
const auth = require('../../../logs/credentials');
const opsAuth = require('../../../logs/ops-credentials');


describe('GET /api/address', () => {
  it('return address', (done) => {
    request(app)
      .get('/api/addresses')
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});


describe('POST /api/addresses', () => {
  it('save address', (done) => {
    request(app)
      .post('/api/addresses')
      .send({
        salutation: 'Mr',
        first_name: 'Manjesh',
        last_name: 'V',
        country_id: 1,
        line1: 'Badanehithlu',
        line2: 'Thirthahalli',
        city: 'Shimoga',
        state: 'Karnataka',
        is_default: true,
        country_code: 91,
        pincode: 577432,
      })
      .set('Authorization', `Bearer ${opsAuth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(201)
      .then(() => {
        done();
      });
  });
});
