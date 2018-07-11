const request = require('supertest');
const app = require('../../app');
const opsAuth = require('../../../logs/ops-credentials');


describe('GET /api/campaigns', () => {
  it('return campaigns', (done) => {
    request(app)
      .get('/api/campaigns')
      .set('Authorization', `Bearer ${opsAuth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('POST /api/campaigns', () => {
  it('save campaigns', (done) => {
    request(app)
      .post('/api/campaigns')
      .send({
        name: 'Vismaya RK',
        campaign_file:
          {
            filename: '1519393122.jpg',
            base64: 'aGVsbG8=',
          },
        customer_id: '108',
        comment: 'Easter Cashback',
        coupon_code: 'EASTER10',
        offer_percentage: '10',
        starts_at: '2018-03-05',
        expires_at: '2018-04-01',
        offer_type: 'cashback',
        slug: 'easter',
      })
      .set('Authorization', `Bearer ${opsAuth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(201)
      .then(() => {
        done();
      });
  });
});

describe('put /api/campaigns', () => {
  it('update campaigns', (done) => {
    request(app)
      .put('/api/campaigns/1')
      .send({
        expires_at: '2018-04-15',
      })
      .set('Authorization', `Bearer ${opsAuth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});
