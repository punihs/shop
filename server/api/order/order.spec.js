const request = require('supertest');
const app = require('./../../app');
const auth = require('../../../logs/credentials');
const opsAuth = require('../../../logs/ops-credentials');


describe('Orders', () => {
  it(' stores order in pakcage table', (done) => {
    request(app)
      .post('/api/orders?type=INCOMING')
      .send({
        store_id: 1,
        customer_id: 646,
        tracking_number: 'DELHIVERY123',
        invoice_code: 'INV123',
        comments: 'Items recieved in good condition',
        invoice: 'meena.jpg',
      })
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(201)
      .then(() => {
        done();
      });
  });

  it('save order by customer', (done) => {
    request(app)
      .post('/api/orders')
      .send({
        customer_id: 646,
        store_id: 1,
        name: 'Chalo Chappals',
        tracking_number: 'DELHIVERY123',
        invoice_code: 'INV123',
        comments: 'Items recieved in good condition',
        invoice_file: {
          filename: 'x.txt',
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

  it('save order without image', (done) => {
    request(app)
      .post('/api/orders')
      .send({
        name: 'Moto E',
        customer_id: 646,
        store_id: 1,
        tracking_number: 'DLV879',
        invoice_code: 'DLV879',
        comments: 'Saved with out photo',
      })
      .set('Authorization', `Bearer ${opsAuth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(201)
      .then(() => {
        done();
      });
  });

  it('return orders for user', (done) => {
    request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });


  it('return orders for ops', (done) => {
    request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${opsAuth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});
