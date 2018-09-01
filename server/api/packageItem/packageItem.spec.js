const request = require('supertest');
const app = require('./../../app');

const { Package, PackageItem } = require('../../conn/sqldb');
const auth = require('../../../logs/credentials');
const opsAuth = require('../../../logs/ops-credentials');

describe('GET /api/packageItem', () => {
  it('return packageItem', (done) => {
    request(app)
      .get('/api/packageItems')
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('GET /api/packageItems/:id', () => {
  let pkg = '';
  let pkgItem = '';
  before(() => Promise.all([
    Package.create({})
      .then((pack) => {
        pkg = pack;
      })
      .then(() => PackageItem
        .create({
          package_id: pkg.id,
          object: '20180829.jpg',
        }))
      .then((pack) => {
        pkgItem = pack;
      }),
  ]));

  it('get packageItem ', (done) => {
    request(app)
      .get(`/api/packageItems/${pkgItem.id}`)
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});


describe('POST /api/packageItem', () => {
  let pkg;
  before((done) => {
    Package.create({}).then((pack) => {
      pkg = pack;
      done();
    });
  });

  it('save packageItem', (done) => {
    request(app)
      .post('/api/packageItems')
      .send({
        name: 'kurtha2',
        package_id: pkg.id,
        package_item_category_id: 9,
        quantity: 1,
        price_amount: 200,
        confirmed_by: 1,
        photo_file: {
          filename: 'x.jpg',
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

  after((done) => {
    PackageItem
      .destroy({ force: true, where: { package_id: pkg.id } })
      .then(() => pkg
        .destroy({ force: true })
        .then(() => {
          done();
        }));
  });
});

describe('PUT /api/packageItem update meta', () => {
  let pkg;
  before((done) => {
    Package.create({}).then((pack) => {
      pkg = pack;
      done();
    });
  });

  it('PUT packageItem', (done) => {
    request(app)
      .put('/api/packageItems/1')
      .send({
        name: 'mobile',
        package_item_category_id: 7,
        quantity: 2,
        price_amount: 3000,
      })
      .set('Authorization', `Bearer ${opsAuth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });

  after((done) => {
    PackageItem
      .destroy({ force: true, where: { package_id: pkg.id } })
      .then(() => pkg
        .destroy({ force: true })
        .then(() => {
          done();
        }));
  });
});

describe('Destroy /api/packageItem', () => {
  let pkg;
  before((done) => {
    Package.create({}).then((pack) => {
      pkg = pack;
      done();
    });
  });

  it('Destroy packageItem', (done) => {
    request(app)
      .delete(`/api/packageItems/${pkg.id}`)
      .set('Authorization', `Bearer ${opsAuth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});
