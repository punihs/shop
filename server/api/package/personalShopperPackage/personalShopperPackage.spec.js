const request = require('supertest');
const app = require('../../../app');
const auth = require('../../../../logs/credentials');

describe('POST /api/packages/personalShopperPackage', () => {
  it('create/submit personalShopperPackages', (done) => {
    request(app)
      .post('/api/packages/personalShopperPackage')
      .send({
        store_id: 1,
        store_type: 'Online Store',
        quantity: 1,
        url: 'https://www.amazon.in/',
        code: '67889765',
        name: 'Kurti ',
        color: 'Multi Color',
        size: 'M',
        price_amount: 1000,
        note: 'Please purchase only medium size',
        if_item_unavailable: 'cancel',
      })
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('POST /api/packages/personalShopperPackage', () => {
  it('create/submit personalShopperPackages', (done) => {
    request(app)
      .post('/api/packages/personalShopperPackage')
      .send({
        store_id: 2,
        store_type: 'Online Store',
        quantity: 1,
        url: 'https://www.flipkart.com/',
        code: 'AD5678',
        name: 'T Shirt',
        color: 'Red Color',
        size: 'M',
        price_amount: 500,
        note: 'Please purchase only medium size',
        if_item_unavailable: 'cancel',
      })
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('PUT /api/packages/personalShopperPackage/11', () => {
  it('edit personalShopperPackageItem', (done) => {
    request(app)
      .put('/api/packages/personalShopperPackage/11')
      .send({
        id: 11,
        store_id: 2,
        store_type: 'Online Store',
        quantity: 2,
        url: 'https://www.flipkart.com',
        code: '5684',
        name: ' T Shirt',
        color: ' Red Color',
        size: 'L',
        price_amount: 5000,
        note: 'Please purchase only medium size',
        if_item_unavailable: 'cancel',
      })
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('POST /api/packages/personalShopperPackage/submitOptions', () => {
  it('submitOptions personalShopperPackages', (done) => {
    request(app)
      .post('/api/packages/personalShopperPackage/submitOptions')
      .send([
        {
          id: 9,
          sales_tax: 50,
          delivery_charge: 50,
          promo_code: 'MYNTRA100',
          promo_info: '100 RUPEES OFF',
          if_promo_unavailable: 'proceed_without',
          instruction: 'Nothing',
        }, {
          id: 10,
          sales_tax: 100,
          delivery_charge: 100,
          promo_code: 'MYNTRA100',
          promo_info: '100 RUPEES OFF',
          if_promo_unavailable: 'proceed_without',
          instruction: 'Nothing',
        },
      ])
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('DELETE /api/packages/personalShopperPackage/13/request', () => {
  it('delete personalShopperItems', (done) => {
    request(app)
      .delete('/api/packages/personalShopperPackage/13/request')
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('DELETE /api/packages/personalShopperPackage/26/order', () => {
  it('delete personalShopperPackages', (done) => {
    request(app)
      .delete('/api/packages/personalShopperPackage/26/order')
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('PUT /api/packages/personalShopperPackage/10/updateItem', () => {
  it('update Item in Admin personalShopperPackages', (done) => {
    request(app)
      .put('/api/packages/personalShopperPackage/10/updateItem')
      .send({
        status: 'recieved',
      })
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('PUT /api/packages/personalShopperPackage/18/cancelOrder', () => {
  it('cancel orders', (done) => {
    request(app)
      .put('/api/packages/personalShopperPackage/18/cancelOrder')
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});
