// const debug = require('debug');

// const r = require;
const request = require('supertest');
const moment = require('moment');
// const assert = require('assert');
// const sinon = require('sinon');

const app = require('./../../app');
const auth = require('../../../logs/credentials');
const {
  Address, PackageState, Package, PackageCharge,
} = require('../../conn/sqldb');

const {
  SALUTATIONS: {
    MR,
  },
} = require('../../config/constants');

describe('GET /api/shipments/count?bucket=IN_QUEUE', () => {
  it('return count of shipments in queue', (done) => {
    request(app)
      .get('/api/shipments/count')
      .query({
        bucket: 'IN_QUEUE',
      })
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});
describe('GET /api/shipments/count?bucket=IN_QUEUE', () => {
  it('return count of shipments in queue', (done) => {
    request(app)
      .get('/api/shipments/count')
      .query({
        bucket: 'IN_QUEUE',
      })
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('GET /api/shipments/1/packages', () => {
  it('return packages', (done) => {
    request(app)
      .get('/api/shipments/1/packages')
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('GET /api/shipments/queue', () => {
  it('return the shipments for ship queue', (done) => {
    request(app)
      .get('/api/shipments/queue')
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('GET /api/shipments/326/invoice', () => {
  it('return shipments invoice', (done) => {
    request(app)
      .get('/api/shipments/326/invoice')
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('GET /api/shipments/redirectShipment', () => {
  let pkg = '';
  let stateId = '';
  before(() => Promise.all([Address
    .create({
      salutation: MR,
      first_name: 'Abhinav',
      last_name: 'Mishra',
      line1: 'C/O Deepak Tiwari, 1013 Folsom Ranch Drive,',
      line2: 'Apt 102',
      state: 'Mumbai',
      city: 'Mumbai',
      customer_id: 646,
      is_default: true,
    })
    .then(() => Package.create({}).then((pack) => {
      pkg = pack;
    }))
    .then(() => PackageState
      .create({
        package_id: pkg.id,
        state_id: 5,
        user_id: 646,
        comments: 'testing',
        status: true,
      }).then((packageState) => {
        stateId = packageState.id;
      }))
    .then(() => PackageCharge
      .create({ id: pkg.id }))
    .then(() => Package
      .update({ package_state_id: stateId, customer_id: 646 }, { where: { id: pkg.id } })),
  ]));
  it('will redirect to shipment creation ( test case selected packages for shipment )', (done) => {
    request(app)
      .get(`/api/shipments/redirectShipment?packageIds=${pkg.id}`)
      .send({
        repack: 0,
        sticker: 0,
        extra_packing: 0,
        orginal_box: 0,
        gift_wrap: 0,
        gift_note: 0,
        mark_personal_use: 0,
        invoice_include: 0,
      })
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });

  after(() => Address
    .destroy({ force: true, where: { customer_id: 646 } })
    .then(() => PackageCharge
      .destroy({ force: true, where: { id: pkg.id } }))
    .then(() => Package
      .destroy({ force: true, where: { id: pkg.id } }))
    .then(() => PackageState
      .destroy({ force: true, where: { package_id: pkg.id } })));
});

describe('GET /api/shipments/redirectShipment?packageIds=365214', () => {
  it('will redirect to shipment creation ( test case for package not found )', (done) => {
    request(app)
      .get('/api/shipments/redirectShipment?packageIds=365214')
      .send({
        package_ids: [365214],
        repack: 0,
        sticker: 0,
        extra_packing: 0,
        orginal_box: 0,
        gift_wrap: 0,
        gift_note: 0,
        mark_personal_use: 0,
        invoice_include: 0,
      })
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(400)
      .then(() => {
        done();
      });
  });
});


describe('GET /api/shipments/redirectShipment', () => {
  let pkg = '';
  let stateId = '';
  before(() => Promise.all([Address
    .create({
      salutation: MR,
      first_name: 'Abhinav',
      last_name: 'Mishra',
      line1: 'C/O Deepak Tiwari, 1013 Folsom Ranch Drive,',
      line2: 'Apt 102',
      state: 'Mumbai',
      city: 'Mumbai',
      customer_id: 646,
      is_default: true,
    })
    .then(() => Package.create({}).then((pack) => {
      pkg = pack;
    }))
    .then(() => PackageState
      .create({
        package_id: pkg.id,
        state_id: 5,
        user_id: 646,
        comments: 'testing',
        status: true,
      }).then((packageState) => {
        stateId = packageState.id;
      }))
    .then(() => PackageCharge
      .create({ id: pkg.id }))
    .then(() => Package.update({
      package_state_id: stateId,
      customer_id: 646,
      created_at: moment().add(-25, 'days'),
    }, { where: { id: pkg.id } })),
  ]));
  it('will redirect to shipment creation  ( test case locker number of days expiry ) ', (done) => {
    request(app)
      .get(`/api/shipments/redirectShipment?packageIds=${pkg.id}`)
      .send({
        repack: 0,
        sticker: 0,
        extra_packing: 0,
        orginal_box: 0,
        gift_wrap: 0,
        gift_note: 0,
        mark_personal_use: 0,
        invoice_include: 0,
      })
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('GET /api/shipments/redirectShipment', () => {
  let pkg = '';
  let stateId = '';
  before(() => Promise.all([Address
    .create({
      salutation: MR,
      first_name: 'Abhinav',
      last_name: 'Mishra',
      line1: 'C/O Deepak Tiwari, 1013 Folsom Ranch Drive,',
      line2: 'Apt 102',
      state: 'Mumbai',
      city: 'Mumbai',
      customer_id: 646,
      is_default: true,
    })
    .then(() => Package.create({}).then((pack) => {
      pkg = pack;
    }))
    .then(() => PackageState
      .create({
        package_id: pkg.id,
        state_id: 5,
        user_id: 646,
        comments: 'testing',
        status: true,
      }).then((packageState) => {
        stateId = packageState.id;
      }))
    .then(() => PackageCharge
      .create({ id: pkg.id }))
    .then(() => Package.update({
      package_state_id: stateId,
      customer_id: 646,
      content_type: 2,
      created_at: moment().add(-19, 'days'),
    }, { where: { id: pkg.id } })),
  ]));
  it('will redirect to shipment creation ( test case for special items ) ', (done) => {
    request(app)
      .get(`/api/shipments/redirectShipment?packageIds=${pkg.id}`)
      .send({
        repack: 0,
        sticker: 0,
        extra_packing: 0,
        orginal_box: 0,
        gift_wrap: 0,
        gift_note: 0,
        mark_personal_use: 0,
        invoice_include: 0,
      })
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });

  after(() => Address
    .destroy({ force: true, where: { customer_id: 646 } })
    .then(() => PackageCharge
      .destroy({ force: true, where: { id: 100 } }))
    .then(() => Package
      .update({
        package_state_id: 1,
        created_at: moment().add(25, 'days'),
        content_type: 1,
      }, { where: { id: 2 } }))
    .then(() => PackageState
      .destroy({ force: true, where: { package_id: 2 } }))
    .then(() => PackageState.update({
      state_id: 1,
    }, { where: { id: 1 } })));
});
