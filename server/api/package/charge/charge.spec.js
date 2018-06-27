const request = require('supertest');

const app = require('../../../app');
const auth = require('../../../../logs/credentials');
const opsAuth = require('../../../../logs/ops-credentials');
const { Package, PackageCharge } = require('../../../conn/sqldb');

describe('GET /api/packages/:id/charges', () => {
  it('get packageCharges', (done) => {
    request(app)
      .get('/api/packages/1/charges')
      .set('Authorization', `Bearer ${auth.access_token}`)
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

  it('PUT packageCharges', (done) => {
    request(app)
      .put(`/api/packages/${pkg.id}/charges`)
      .send({
        storage_amount: 100,
        wrong_address_amount: 0.00,
        special_handling_amount: 0.00,
        receive_mail_amount: 0.00,
        pickup_amount: 0.00,
        basic_photo_amount: 10.00,
        advanced_photo_amount: 10.00,
        scan_document_amount: 0.00,
        split_package_amount: 0.00,
      })
      .set('Authorization', `Bearer ${opsAuth.access_token}`)
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

