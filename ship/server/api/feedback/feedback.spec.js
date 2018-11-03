const request = require('supertest');
const app = require('./../../app');
const opsAuth = require('../../../logs/ops-credentials');

describe('Feedback', () => {
  it('return feedbacks', (done) => {
    request(app)
      .post('/api/feedbacks')
      .send({
        person: 'shoppre',
        email: 'shoppre@shoppre.com',
        customer_service: '5',
        arrive_expectation: '5',
        protected_shipment: '5',
        package_condition: '5',
        easy_service: '5',
        overall_level_of_satisfaction: '5',
        suggestions: 'good',
        is_loyalty_points_added: '1',
      })
      .set('Authorization', `Bearer ${opsAuth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(201)
      .then(() => {
        done();
      });
  });
});
