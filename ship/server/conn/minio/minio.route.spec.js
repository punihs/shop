const debug = require('debug');
const request = require('supertest');
const app = require('./../../app');
const auth = require('../../../logs/credentials');

const log = debug('s.conn.minio.route.spec');

describe('presignedUrl', () => {
  log('upload url ');
  it('will give upload url', (done) => {
    request(app)
      .get('/api/minio/presignedUrl?filename=hello.jpg')
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('thumbnail generation', () => {
  it('create thumbnails', (done) => {
    request(app)
      .post('/api/minio/thumb')
      .set('Authorization', `Bearer ${auth.access_token}`)
      .send({
        object: '2018/6/8d7e622b-c556-4c9f-8a31-43f599bda529.png',
      })
      .expect(201)
      .then(() => {
        done();
      });
  });
});
