const request = require('supertest');
const app = require('./../../app');
const auth = require('../../../logs/credentials');


describe('GET /api/schedulePickup', () => {
  it('return schedulePickups list', (done) => {
    request(app)
      .get('/api/schedulePickup')
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('POST /api/schedulePickup', () => {
  it('insert the schedule pickup records', (done) => {
    request(app)
      .post('/api/schedulePickup')
      .send({
        user_first_name: 'dhananjaya',
        user_last_name: 'K S',
        user_email: 'dhananjaya.shekarappa@gmail.com',
        phone_code: '91',
        mobile: '9060122213',
        number_of_packages: 1,
        package_weight: 1,
        size_of_package: '',
        package_items: 1,
        special_items: 'Home Made Food items',
        other_items: '',
        payment_option: 'shoppre_account',
        first_name: 'dhananjaya',
        last_name: 'K S',
        street: 'Tumkur',
        pincode: 572104,
        city: 'Bangalore',
        state: 'Karnataka',
        contact_no: '09060122213',
        email: 'dhananjaya.shekarappa@gmail.com',
        destination_user_first_name: 'Punith',
        destination_user_last_name: 'H S',
        destination_street: '2ND CROSS RD, 1ST BLOCK KORAMANGA',
        destination_city: 'Bengaluru',
        destination_state: 'Karnataka',
        destination_country: 'India',
        destination_pincode: 560034,
        destination_phone_code: '91',
        destination_contact_no: '09060122213',
        comment: 'test',
        is_admin_read: 'yes',
      })
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(201)
      .then(() => {
        done();
      });
  });
});
