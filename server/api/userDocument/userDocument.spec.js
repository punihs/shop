const request = require('supertest');
const app = require('../../app');
const auth = require('../../../logs/credentials');

describe('POST /api/userDocuments', () => {
  it('save userDocuments', (done) => {
    request(app)
      .post('/api/userDocuments')
      .send({
        document_file: {
          filename: 'x.txt',
          base64: 'aGVsbG8=',
        },
      })
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(201)
      .then(() => {
        done();
      });
  });
});

describe('GET /api/userDocuments', () => {
  it('return userDocuments', (done) => {
    request(app)
      .get('/api/userDocuments')
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('DELETE /api/userDocuments', () => {
  it('delete userDocuments', (done) => {
    request(app)
      .delete('/api/userDocuments/1')
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});
