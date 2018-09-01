// const debug = require('debug');

// const r = require;
const request = require('supertest');
const moment = require('moment');
const assert = require('assert');
const sinon = require('sinon');

const app = require('./../../app');
const auth = require('../../../logs/credentials');
const {
  // Package, Address, Country, User, AccessToken, RefreshToken, Session,
  // ShipmentMeta, PackageState,
  ShipmentIssue, Shipment, Address, PackageState, Package, PackageCharge, LoyaltyPoint,
} = require('../../conn/sqldb');

const {
  SALUTATIONS: {
    MR,
  },
} = require('../../config/constants');
const { SHIPPING_PARTNERS: { DHL } } = require('../../config/constants/objects');
const fakeResponse = require('../../conn/shipper/dhl/sample');
const shipper = require('../../conn/shipper');
// const log = debug('s.shipment.spec');

describe('GET /api/shipments', () => {
  it('return 400 on no packages for shipments', (done) => {
    request(app)
      .get('/api/shipments')
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
//
//
// const createUser = customerId => User
//   .destroy({ force: true, where: { id: customerId } })
//   .then(() => User
//     .create({
//       id: customerId,
//       http_referrer_id: 1,
//       is_prime: 0,
//       admin_info: null,
//       email: 'ajayabhinav@gmail.com',
//       google_contacts_accessed: 0,
//       medium: null,
//       country_code: null,
//       email_verify: 'yes',
//       name: 'Abhinav Mishra',
//       updated_at: '2018-05-15T17:05:19.000+05:30',
//       admin_read: 'yes',
//       remember_token: 'ffOK9DhHYRMRSjOiMES7aT7uIfk9vEoIfzDCplR752nc068ShZZ9wsuWcXvz',
//       is_seller: '0',
//       email_token: null,
//       virtual_address_code: 'SHPR82-162',
//       phone: null,
//       password: '$2y$10$4Yg4RRg.HLMIpvd2L5nQO.vaRT.cW9NlsfXwi5alT1nKCa7dIs1R6', // admin1234
//       created_at: '2017-10-19T20:55:50.000+05:30',
//       referred_customer_id: null,
//     }));
//
// const addressCreate = () => {
//   log('addressCreate');
//
//   return Address
//     .create({
//       id: 14,
//       is_default: 1,
//       country: 'United States',
//       city: 'Cary',
//       pincode: '27519',
//       country_code: 1,
//       line2: null,
//       updated_at: '2017-12-11T13:42:00.000+05:30',
//       last_name: null,
//       customer_id: 646,
//       first_name: 'DIvya Shukla',
//       phone: '8605147509',
//       state: 'NC',
//       created_at: '2017-12-11T13:42:00.000+05:30',
//       salutation: null,
//       line1: '314 Euphoria Circle',
//       country_id: 226,
//     });
// };
//
// const deleteAddress = () => Address
//   .destroy({ force: true, where: { id: 14 } });
//
// const createPackages = () => {
//   log('createPackages');
//   const pack = r('./data/cid_646_sid_10_packages.json')[0];
//   return Package
//     .create(pack)
//     .then(pkg => PackageState
//       .create({ ...pack.PackageState, package_id: pkg.id })
//       .then(packageState => pkg
//         .update({ package_state_id: packageState.id })));
// };
//
// const deletePackages = packageId => PackageState
//   .destroy({
//     force: true,
//     where: {
//       package_id: packageId,
//     },
//   })
//   .then(() => Package
//     .destroy({
//       force: true,
//       where: {
//         id: packageId,
//       },
//     }));
//
// const login = () => new Promise((resolve, reject) => request(app)
//   .post('/oauth/token')
//   .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
//   .send({
//     username: 'ajayabhinav@gmail.com',
//     password: 'admin1234',
//   })
//   .expect('Content-Type', /json/)
//   .expect(200)
//   .then((response) => {
//     log('login done', response.body, response.text);
//     resolve(response.body);
//   })
//   .catch((err) => {
//     log('login error', err);
//     reject(err);
//   }));
//
// const clearLogin = customerId => Promise
//   .all([
//     AccessToken.destroy({ where: { user_id: customerId } }),
//     RefreshToken.destroy({ where: { user_id: customerId } }),
//   ])
//   .then(() => Session.destroy({ where: { user_id: customerId } }));
//
// const deleteShipment = customerId => Shipment
//   .findAll({ where: { customer_id: customerId } })
//   .then(shipments => ShipmentMeta
//     .destroy({ force: true, where: { id: shipments.map(x => x.id) } })
//     .then(() => Shipment.destroy({
//       force: true,
//       where: { customer_id: customerId },
//     })));

// let customerAuth;

describe('GET /api/shipments/:id', () => {
  before((done) => {
    sinon
      .stub(shipper[DHL], 'status').callsFake(() => Promise.resolve(fakeResponse));

    Promise.all([
      ShipmentIssue.destroy({ where: { shipment_id: 10 } }),
    ]).then(() => Shipment
      .destroy({
        force: true,
        where: {
          id: 10,
        },
      })
      .then(() => Shipment
        .create({
          id: 10,
          coupon: 0.0,
          is_axis_banned_item: '0',
          estimated: 15680.0,
          package_ids: '41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,66,75,76,77,83,84,85,86,87,88,93,94,95,96,98,99,115,117,118',
          country: 226,
          wallet: 0.0,
          full_name: 'Divya Shukla',
          city: 'North Carolina',
          discount: 15680.0,
          sub_total: 31360.0,
          admin_info: null,

          payment_gateway_fee: null,
          final_amount: 15680.0,
          count: 41,
          schedule_pickup_id: 1,
          courier_charge: null,
          value: 6679.92,
          is_missed: 0,
          order_code: '631-646-7270',
          updated_at: '2018-05-18T05:58:10.000+05:30',
          address: '314 Euphoria Circle, Cary, NC, United States - 27519',
          volumetric_weight: null,
          admin_read: 'yes',
          package_level_charges: 0.0,
          customer_id: 646,
          actual_weight: 0.0,
          promo_code: null,
          phone: '-8605147508',
          shipment_type: null,
          created_at: '2017-12-11T13:46:00.000+05:30',
          loyalty: 0.0,
          shipping_status: 'delivered',
          status: 'success',
          payment_gateway_name: 'wire',
          weight: 27.35,
          pick_up_charge: null,
          dispatch_date: '2017-12-11T13:46:00.000+05:30',

          shipping_partner_id: DHL, // replace with valid test data
          tracking_code: '6422614100', // replace with valid test data
        })
        .then(() => done())));
  });

  after(() => {
    shipper[DHL].status.restore();
  });


  it('return shipments', (done) => {
    request(app)
      .get('/api/shipments/10')
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => done());
  });

  it('will tracking shipment delivery status', (done) => {
    request(app)
      .get('/api/shipments/10/status')
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        const response = JSON.parse(res.text);
        const events = response.result['req:TrackingResponse'].AWBInfo[1].ShipmentInfo.ShipmentEvent;
        const lastEvent = events[events.length - 1];
        const lastStatus = lastEvent.ServiceEvent.Description;
        assert(lastStatus === 'Delivered - Signed for by', 'should be delivered');
        done();
      });
  });
});
//
// const baseSetup = ({ customerId, countryId, packageIds }) => Promise
//   .all([
//     deleteAddress(),
//     deletePackages(packageIds),
//     clearLogin(customerId),
//     deleteShipment(customerId),
//   ])
//   .then(() => createUser(customerId)
//     .then(() => Promise
//       .all([
//         login(),
//         addressCreate(),
//         createPackages(),
//         Country.update({ discount_percentage: 50 }, { where: { id: countryId } }),
//       ])));

// describe('POST /api/shipments 1', () => {
//   const packageIds = [
//     41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60,
//     61, 62, 66, 75, 76, 77, 83, 84, 85, 86, 87, 88, 93, 94, 95, 96, 98, 99, 115,
//     117, 118,
//   ];
//   const addressId = 14;
//   const customerId = 646;
//   const countryId = 226;
//
//
//   beforeEach((done) => {
//     log('beforeEach');
//     baseSetup({ customerId, countryId, packageIds })
//       .then(([a]) => {
//         log('auth', typeof auth, auth);
//         customerAuth = a;
//         done();
//       });
//   });
//
//   it('create shiprequest', (done) => {
//     log('4');
//     request(app)
//       .post('/api/shipments')
//       .send({
//         address_id: addressId,
//         package_ids: packageIds,
//         repack: '0',
//         sticker: '0',
//         extrapack: '0',
//         original: '0',
//         gift_wrap: '0',
//         gift_note: '0',
//         invoice_personal: '0',
//         invoice_include: '0',
//       })
//       .set('Authorization', `Bearer ${customerAuth.access_token}`)
//       .expect('Content-Type', /json/)
//       .expect(201)
//       .then(() => {
//         done();
//       });
//   });
// });

// describe('POST /api/shipments', () => {
//   it('confirm/submit Shiprequest', (done) => {
//     request(app)
//       .post('/api/shipments')
//       .send({
//         package_ids: '1601',
//         repack: '0',
//         sticker: '0',
//         extrapack: '0',
//         original: '0',
//         gift_wrap: '0',
//         gift_note: '0',
//         liquid: '0',
//         invoice_personal: '0',
//         invoice_include: '0',
//         address_id: '335',
//       })
//       .set('Authorization', `Bearer ${auth.access_token}`)
//       .expect('Content-Type', /json/)
//       .expect(201)
//       .then(() => {
//         done();
//       });
//   });
// });

// describe('POST /api/shipments', () => {
//   it('proceed Payment', (done) => {
//     request(app)
//       .post('/api/shipments')
//       .send({
//         ship_request_id: '462',
//         insurance: '2',
//         wallet: '0',
//         payment_gateway_name: 'wire',
//       })
//       .set('Authorization', `Bearer ${auth.access_token}`)
//       .expect('Content-Type', /json/)
//       .expect(201)
//       .then(() => {
//         done();
//       });
//   });
// });

// describe('PUT /api/shipments', () => {
//   it('Admin/submit Payment', (done) => {
//     request(app)
//       .put('/api/shipments')
//       .send({
//         full_name: 'Chris Reddy',
//         phone: '+355-45778900-9',
//         address: '# 181, 2nd Cross Road, 7th Main ,
// 1st block koramangala, Bangalore, Karnataka, India - 560034',
//         weight: '2',
//         actual_weight: '2',
//         volumetric_weight: '1',
//         sub_total: '9445.00',
//         discount: '4722.50',
//         package_level_charges: '0.00',
//         pick_up_charge: '0',
//         shipment_type: 'locker',
//         shipping_status: 'confirmation',
//         ship_request_id: '1',
//       })
//       .set('Authorization', `Bearer ${auth.access_token}`)
//       .expect('Content-Type', /json/)
//       .expect(201)
//       .then(() => {
//         done();
//       });
//   });
// });

// describe('PUT /api/shipments', () => {
//   it('Admin/payment recieved', (done) => {
//     request(app)
//       .put('/api/shipments')
//       .send({
//         full_name: 'Chris Reddy',
//         phone: '+355-45778900-9',
//         address: '# 181, 2nd Cross Road, 7th Main ,
// 1st block koramangala, Bangalore, Karnataka, India - 560034',
//         weight: '2.00',
//         actual_weight: '2.00',
//         volumetric_weight: '1.00',
//         sub_total: '9445.00',
//         discount: '4722.50',
//         package_level_charges: '0.00',
//         pick_up_charge: '0',
//         shipment_type: 'locker',
//         shipping_status: 'received',
//         ship_request_id: '1',
//       })
//       .set('Authorization', `Bearer ${auth.access_token}`)
//       .expect('Content-Type', /json/)
//       .expect(201)
//       .then(() => {
//         done();
//       });
//   });
// });
//
// describe('PUT /api/shipments', () => {
//   it('Admin/payment failed', (done) => {
//     request(app)
//       .post('/api/shipments')
//       .send({
//         full_name: 'Chris Reddy',
//         phone: '+355-45778900-9',
//         address: '# 181, 2nd Cross Road, 7th Main ,
// 1st block koramangala, Bangalore, Karnataka, India - 560034',
//         weight: '2.00',
//         actual_weight: '2.00',
//         volumetric_weight: '1.00',
//         sub_total: '9445.00',
//         discount: '4722.50',
//         package_level_charges: '0.00',
//         pick_up_charge: '0',
//         shipment_type: 'locker',
//         shipping_status: 'pay_failed',
//         ship_request_id: '1',
//       })
//       .set('Authorization', `Bearer ${auth.access_token}`)
//       .expect('Content-Type', /json/)
//       .expect(201)
//       .then(() => {
//         done();
//       });
//   });
// });

// describe('POST /api/shipments', () => {
//   it('Admin/Tracking', (done) => {
//     request(app)
//       .post('/api/shipments')
//       .send({
//         ship_request_date: '2018-05-26',
//         carrier: 'DTDC-DHL',
//         box_nos: '1',
//         package_weight: '2.00',
//         package_value: '300.00',
//         tracking_id: '56567678',
//         trackingid: '386',
//       })
//       .set('Authorization', `Bearer ${auth.access_token}`)
//       .expect('Content-Type', /json/)
//       .expect(201)
//       .then(() => {
//         done();
//       });
//   });
// });
//
// describe('PUT /api/shipments', () => {
//   it('Admin/Dispatched', (done) => {
//     request(app)
//       .post('/api/shipments')
//       .send({
//         full_name: 'Chris Reddy',
//         phone: '+355-45778900-9',
//         address: '# 181, 2nd Cross Road, 7th Main ,
// 1st block koramangala, Bangalore, Karnataka, India - 560034',
//         weight: '2.00',
//         actual_weight: '2.00',
//         volumetric_weight: '1.00',
//         sub_total: '9445.00',
//         discount: '4722.50',
//         package_level_charges: '0.00',
//         pick_up_charge: 0,
//         shipment_type: 'locker',
//         shipping_status: 'dispatched',
//         ship_request_id: '1',
//       })
//       .set('Authorization', `Bearer ${auth.access_token}`)
//       .expect('Content-Type', /json/)
//       .expect(201)
//       .then(() => {
//         done();
//       });
//   });
// });

// describe('PUT /api/shipments', () => {
//   it('Admin/Delivered', (done) => {
//     request(app)
//       .post('/api/shipments')
//       .send({
//         full_name: 'Chris Reddy',
//         phone: '+355-45778900-9',
//         address: '# 181, 2nd Cross Road, 7th Main ,
// 1st block koramangala, Bangalore, Karnataka, India - 560034',
//         weight: '2.00',
//         actual_weight: '2.00',
//         volumetric_weight: '1.00',
//         sub_total: '9445.00',
//         discount: '4722.50',
//         package_level_charges: '0.00',
//         pick_up_charge: '0',
//         shipment_type: 'locker',
//         shipping_status: 'delivered',
//         ship_request_id: '1',
//       })
//       .set('Authorization', `Bearer ${auth.access_token}`)
//       .expect('Content-Type', /json/)
//       .expect(201)
//       .then(() => {
//         done();
//       });
//   });
// });

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

describe('GET /api/shipments/history', () => {
  it('return the shipments for ship history', (done) => {
    request(app)
      .get('/api/shipments/history')
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('DELETE /api/shipments', () => {
  it('delete shipments', (done) => {
    request(app)
      .delete('/api/shipments/11')
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

describe('PUT /api/shipments/finalShip', () => {
  it(' will create final ship request after payment done ', (done) => {
    request(app)
      .put('/api/shipments/finalShip')
      .send({
        shipment_id: 116,
        insurance: 2,
        wallet: 1,
        payment_gateway_name: 'wire',
      })
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('PUT /api/shipments/2/cancel 1', () => {
  it('will cancel the ship request', (done) => {
    request(app)
      .put('/api/shipments/2/cancel')
      .send({
        order_code: '631-646-7270',
        customer_id: 646,
      })
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('PUT /api/shipments/payRetrySubmit', () => {
  it(' will create final ship request after payment done ', (done) => {
    request(app)
      .put('/api/shipments/payRetrySubmit')
      .send({
        shipment_id: 300,
        insurance: 2,
        wallet: 0,
        payment_gateway_name: 'cash',
      })
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('PUT /api/shipments/payRetrySubmit', () => {
  it(' will create final ship request after payment done ', (done) => {
    request(app)
      .put('/api/shipments/payRetrySubmit')
      .send({
        shipment_id: 300,
        insurance: 2,
        wallet: 0,
        payment_gateway_name: 'wire',
      })
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('PUT /api/shipments/payRetrySubmit', () => {
  it(' pay retry for wallet transaction  ', (done) => {
    request(app)
      .put('/api/shipments/payRetrySubmit')
      .send({
        shipment_id: 300,
        insurance: 0,
        wallet: 1,
        payment_gateway_name: 'wallet',
      })
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('PUT /api/shipments/retryPayment?order_code=620-620-7220', () => {
  before(async () => Shipment.update({ payment_status: 'failed' }, { where: { order_code: '620-620-7220' } }));
  it(' will allow to change the payment mode ', (done) => {
    request(app)
      .put('/api/shipments/retryPayment?order_code=620-620-7220')
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

  // after(() => Address
  //   .destroy({ force: true, where: { customer_id: 646 } })
  //   .then(() => PackageCharge
  //     .destroy({ force: true, where: { id: 100 } }))
  //   .then(() => Package
  //     .update({
  //       package_state_id: 1,
  //       created_at: moment().add(25, 'days'),
  //     }, { where: { id: 2 } }))
  //   .then(() => PackageState
  //     .destroy({ force: true, where: { package_id: 2 } })));
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

describe('PUT /api/shipments/115/state', () => {
  before(async () => LoyaltyPoint.create({
    total_points: '100', points: '100', customer_id: 129, level: 1,
  }));
  it(' will create final ship request after payment done ', (done) => {
    request(app)
      .put('/api/shipments//115/state')
      .send({
        state_id: 22,
        comments: 'shipment state change',
      })
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('PUT /api/shipments/116', () => {
  it(' Update shipment', (done) => {
    request(app)
      .put('/api/shipments/116')
      .send({
        address: '314 Euphoria Circle, Cary, NC, United States - 27519',
        coupon_amount: 0,
        customer_name: 'Abhinav Mishra',
        discount_amount: 15680,
        estimated_amount: 15680,
        final_amount: 15680,
        final_weight: 27.35,
        loyalty_amount: 0,
        package_level_charges_amount: 0,
        packages_count: 1,
        payment_gateway_fee_amount: 0,
        phone: '-8605147508',
        pick_up_charge_amount: 200,
        shipment_type_id: 1,
        sub_total_amount: 31360,
        value_amount: 6679.92,
        volumetric_weight: 0,
        wallet_amount: 0,
        weight: 3,
      })
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('PUT /api/shipments/115', () => {
  it(' Update shipment', (done) => {
    request(app)
      .put('/api/shipments/115')
      .send({
        address: '314 Euphoria Circle, Cary, NC, United States - 27519',
        coupon_amount: 0,
        customer_name: 'Abhinav Mishra',
        discount_amount: 15680,
        estimated_amount: 15680,
        final_amount: 15680,
        final_weight: 27.35,
        loyalty_amount: 0,
        package_level_charges_amount: 0,
        packages_count: 1,
        payment_gateway_fee_amount: 0,
        phone: '-8605147508',
        pick_up_charge_amount: 200,
        shipment_type_id: 1,
        sub_total_amount: 31360,
        value_amount: 6679.92,
        volumetric_weight: 0,
        wallet_amount: 0,
        weight: 8,
      })
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('GET /api/shipments/cron/partners', () => {
  it('returns all shipments for cron', (done) => {
    request(app)
      .get('/api/shipments/cron/partners')
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('GET /api/shipments/115/request/shipRequestResponse', () => {
  it('shipRequest Response', (done) => {
    request(app)
      .get('/api/shipments/115/request/shipRequestResponse')
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('GET /api/shipments/:id/request/response', () => {
  let pkg = '';
  before(() => Promise.all([Shipment
    .create({ customer_id: 646, payment_gateway_id: 1 }).then((pack) => {
      pkg = pack;
    }),
  ]));
  it('shipRequest Response', (done) => {
    request(app)
      .get(`/api/shipments/${pkg.id}/request/response`)
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});
