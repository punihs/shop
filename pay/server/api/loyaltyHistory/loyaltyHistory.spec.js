// const request = require('supertest');
// const app = require('../../app');
// const opsAuth = require('../../../logs/ops-credentials');

// describe('POST /api/loyaltyHistories', () => {
//   it('created loyaltyPoints', (done) => {
//     request(app)
//       .post('/api/loyaltyHistories')
//       .send({
//         customer_id: 646,
//         points: 50,
//         description: 'For Google Feedback',
//       })
//       .set('Authorization', `Bearer ${opsAuth.access_token}`)
//       .expect('Content-Type', /json/)
//       .expect(200)
//       .then(() => {
//         done();
//       });
//   });
// });
