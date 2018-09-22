const request = require('supertest');
const app = require('../../../app');
const {
  Package, PhotoRequest, PackageItem, PackageCharge,
} = require('../../../conn/sqldb');
const auth = require('../../../../logs/credentials');

describe('POST /api/packages/:id/photoRequests standard_photo', () => {
  let pkg;
  before((done) => {
    Package
      .create({})
      .then((pack) => {
        pkg = pack;
        return PackageItem
          .create({ package_id: pack.id })
          .then(() => {
            done();
          });
      });
  });

  it('POST basicPhotoRequest', (done) => {
    request(app)
      .put(`/api/packages/${pkg.id}/photoRequests`)
      .send({
        type: 'standard_photo',
      })
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(201)
      .then(() => {
        done();
      });
  });

  after((done) => {
    Promise
      .all([
        PhotoRequest
          .destroy({ force: true, where: { package_id: pkg.id } }),
        PackageItem
          .destroy({ force: true, where: { package_id: pkg.id } }),
        PackageCharge
          .destroy({ force: true, where: { id: pkg.id } }),
      ])
      .then(() => pkg
        .destroy({ force: true })
        .then(() => {
          done();
        }));
  });
});

