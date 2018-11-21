const request = require('supertest');

const auth = require('../../../logs/credentials');
const opsAuth = require('../../../logs/ops-credentials');

const app = require('./../../app');

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


describe('GET /api/address by id', () => {
  it('return address by id', (done) => {
    request(app)
      .get('/api/addresses/2')
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('error POST /api/addresses ', () => {
  it('should through error if no salutation', (done) => {
    request(app)
      .post('/api/addresses')
      .send({
        first_name: 'Manjesh',
        last_name: 'V',
        line1: 'A+202 2C Hiranandani Link Road 2C Kailash Industrial Complex  2C  Vikhroli West',
        line2: 'Beside Telephone Exchange 2C10th block 2C Nagarbhavi 2C',
        city: 'Mumbai',
        state: 'Maharashtra',
        country_id: '99',
        pincode: '400079',
        phone: '919844717202',
        is_default: true,
        customer_id: 646,
      })
      .set('Authorization', `Bearer ${opsAuth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(400)
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
        line1: 'A+202 2C Hiranandani Link Road 2C Kailash Industrial Complex  2C  Vikhroli West',
        line2: 'Beside Telephone Exchange 2C10th block 2C Nagarbhavi 2C',
        city: 'Mumbai',
        state: 'Maharashtra',
        country_id: '99',
        pincode: '400079',
        phone: '9844717202',
        is_default: '1',
        customer_id: 646,
      })
      .set('Authorization', `Bearer ${opsAuth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(201)
      .then(() => {
        done();
      });
  });
});

describe('put /api/addresses', () => {
  it('update address', (done) => {
    request(app)
      .put('/api/addresses/1/default')
      .send({
        is_default: '1',
      })
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});
