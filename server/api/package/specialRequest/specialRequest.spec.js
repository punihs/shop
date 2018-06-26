const request = require('supertest');

const app = require('../../../app');
const auth = require('../../../../logs/credentials');

describe('PUT /api/packages/1return', () => {
  it('PUT return', (done) => {
    request(app)
      .put('/api/packages/1/return')
      .send({
        return_type: 'return_pickup',
        message1: 'please return my package',
        message2: 'please return my package by shoppre',
        returnVerify: 1,
        returnPackid: 1,
      })
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(201)
      .then(() => {
        done();
      });
  });
});

describe('PUT /api/packages/split', () => {
  it('PUT split', (done) => {
    request(app)
      .put('/api/packages/1/split')
      .send({
        message: 'split package',
        returnVerify: 1,
        splitPackid: 41,
      })
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(201)
      .then(() => {
        done();
      });
  });
});


describe('PUT /api/packages/1/abandon', () => {
  it('PUT abandon', (done) => {
    request(app)
      .put('/api/packages/1/abandon')
      .send({
        abandonPackid: 1,
      })
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(201)
      .then(() => {
        done();
      });
  });
});

