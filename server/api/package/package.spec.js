const request = require('supertest');
const app = require('./../../app');
const auth = require('../../../logs/credentials');
const opsAuth = require('../../../logs/ops-credentials');
const wwwAuth = require('../../../logs/www-credentials');

const {
  CONTENT_TYPES: { REGULAR, SPECIAL },
} = require('../../config/constants');

const {
  Package, PackageCharge,
} = require('../../conn/sqldb');


describe('public: GET /api/packages', () => {
  it('return packages', (done) => {
    request(app)
      .get('/api/packages?public=true')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('www: GET /api/packages ', () => {
  it('return packages', (done) => {
    request(app)
      .get('/api/packages')
      .set('Authorization', `Bearer ${wwwAuth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

const abhinavAuth = auth;

describe('member GET /api/packages', () => {
  it('return packages', (done) => {
    request(app)
      .get('/api/packages')
      .set('Authorization', `Bearer ${abhinavAuth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('ops GET /api/packages', () => {
  it('return packages', (done) => {
    request(app)
      .get('/api/packages?fl=id,name,state_id,state_name&limit=15&offset=0&q=&sid=&sort=-&status=VALUES')
      .set('Authorization', `Bearer ${opsAuth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});


describe('1 POST /api/packages', () => {
  it('save packages', (done) => {
    request(app)
      .post('/api/packages')
      .send({
        type: 1,
        customer_id: 646,
        store_id: 1,
        invoice_code: 'FLIP123',
        weight: 1,
        price_amount: 100,
        content_type: REGULAR,
      })
      .set('Authorization', `Bearer ${opsAuth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(201)
      .then(() => {
        done();
      });
  });
});

describe('Packages', () => {
  it('save package by customer', (done) => {
    request(app)
      .post('/api/packages')
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
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(201)
      .then(() => {
        done();
      });
  });
});

describe('POST /api/packages update meta', () => {
  it('update packages', (done) => {
    request(app)
      .put('/api/packages/1')
      .send({
        seller: 'Amazon.in',
        invoice_code: '123',
        is_doc: true,
        price_amount: 2000,
        weight: 2,
        content_type: SPECIAL,
        status: 'review',
      })
      .set('Authorization', `Bearer ${opsAuth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('DELETE /api/packages/1', () => {
  it('save packages', (done) => {
    request(app)
      .delete('/api/packages/1')
      .set('Authorization', `Bearer ${opsAuth.access_token}`)
      // .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

// describe('www: GET /api/packages/count ', () => {
//   it('return packages', (done) => {
//     request(app)
//       .get('/api/packages/count')
//       .set('Authorization', `Bearer ${wwwAuth.access_token}`)
//       .expect('Content-Type', /json/)
//       .expect(200)
//       .then(() => {
//         done();
//       });
//   });
// });

describe('Destroy /api/package', () => {
  let pkg;
  before((done) => {
    Package.create({}).then((pack) => {
      pkg = pack;
      done();
    });
  });

  it('Destroy packages', (done) => {
    request(app)
      .delete(`/api/packages/${pkg.id}`)
      .set('Authorization', `Bearer ${opsAuth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});


describe('PUT /api/packages/1/charges update charges', () => {
  let pkg;
  before((done) => {
    Package.create({}).then((pack) => {
      pkg = pack;
      done();
    });
  });

  it('PUT invoice', (done) => {
    request(app)
      .put(`/api/packages/${pkg.id}/invoice`)
      .send({
        invoice: '2018/7/71158866-3c30-4dcc-91d9-93c1b71e5f21.png',
      })
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });

  after((done) => {
    PackageCharge
      .destroy({ force: true, where: { id: pkg.id } })
      .then(() => pkg
        .destroy({ force: true })
        .then(() => {
          done();
        }));
  });
});

