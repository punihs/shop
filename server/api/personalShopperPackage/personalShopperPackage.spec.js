const request = require('supertest');
const app = require('../../app');
const auth = require('../../../logs/credentials');
const {
  Package,
} = require('../../conn/sqldb');

describe('GET /api/personalShopperPackages/1/orderForm', () => {
  it('return orders', (done) => {
    request(app)
      .get('/api/personalShopperPackages/1/orderForm')
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('GET /api/personalShopperPackages/1/shopperCart', () => {
  it('return orders', (done) => {
    request(app)
      .get('/api/personalShopperPackages/1/shopperCart')
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('GET /api/personalShopperPackages/1/editOrder', () => {
  it('return orders', (done) => {
    request(app)
      .get('/api/personalShopperPackages/1/editOrder')
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('POST /api/personalShopperPackages', () => {
  it('create/submit personalShopperPackages', (done) => {
    request(app)
      .post('/api/personalShopperPackages')
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

describe('POST /api/personalShopperPackages', () => {
  it('create/submit personalShopperPackages', (done) => {
    request(app)
      .post('/api/personalShopperPackages')
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

// describe('1 PUT /api/personalShopperPackages', () => {
//   it('update personalShopperPackages', (done) => {
//     request(app)
//       .put('/api/personalShopperPackages')
//       .send({
//         id: 2,
//         store_id: 1,
//         store_type: 'Online Store',
//         quantity: 1,
//         url: 'https://www.flipkart.com',
//         code: '5684',
//         name: ' T Shirt',
//         color: ' Red Color',
//         size: 'L',
//         price_amount: 5000,
//         note: 'Please purchase only medium size',
//         if_item_unavailable: 'cancel',
//       })
//       .set('Authorization', `Bearer ${auth.access_token}`)
//       .expect('Content-Type', /json/)
//       .expect(200)
//       .then(() => {
//         done();
//       });
//   });
// });

// describe('POST /api/personalShopperPackages/submitOptions', () => {
//   it('submitOptions personalShopperPackages', (done) => {
//     request(app)
//       .post('/api/personalShopperPackages/submitOptions')
//       .send([
//         {
//           id: 2,
//           sales_tax: 50,
//           delivery_charge: 50,
//           promo_code: 'MYNTRA100',
//           promo_info: '100 RUPEES OFF',
//           if_promo_unavailable: 'proceed_without',
//           instruction: 'Nothing',
//         }, {
//           id: 2,
//           sales_tax: 50,
//           delivery_charge: 100,
//           promo_code: 'MYNTRA100',
//           promo_info: '100 RUPEES OFF',
//           if_promo_unavailable: 'proceed_without',
//           instruction: 'Nothing',
//         },
//       ])
//       .set('Authorization', `Bearer ${auth.access_token}`)
//       .expect('Content-Type', /json/)
//       .expect(200)
//       .then(() => {
//         done();
//       });
//   });
// });

describe('POST /api/personalShopperPackages/submitPayment', () => {
  before(async () => Package.update({ status: 'pending', payment_status: 'pending' }, { where: { invoice_code: 'P646873' } }));

  it('submit Payment personalShopperPackages', (done) => {
    request(app)
      .post('/api/personalShopperPackages/submitPayment')
      .send({
        payment_gateway_name: 'wire',
        hdn_reference_code: 'P646873',
      })
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('GET /api/personalShopperPackages/orderPayChange', () => {
  it('orderPayChange', (done) => {
    request(app)
      .get('/api/personalShopperPackages/orderPayChange')
      .send({
        invoice_code: 'P646873',
      })
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('GET /api/personalShopperPackages/shopperOptions', () => {
  it('return orders', (done) => {
    request(app)
      .get('/api/personalShopperPackages/shopperOptions')
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('GET /api/personalShopperPackages/shopperSummary', () => {
  it('return orders', (done) => {
    request(app)
      .get('/api/personalShopperPackages/shopperSummary')
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('GET /api/personalShopperPackages/shopperPayment', () => {
  it('return orders', (done) => {
    request(app)
      .get('/api/personalShopperPackages/shopperPayment')
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('GET /api/personalShopperPackages/shopperHistory', () => {
  it('return orders', (done) => {
    request(app)
      .get('/api/personalShopperPackages/shopperHistory')
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('GET /api/personalShopperPackages/orderInvoice', () => {
  it('return orders', (done) => {
    request(app)
      .get('/api/personalShopperPackages/orderInvoice')
      .send({
        invoice_code: 'P646873',
      })
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('GET /api/personalShopperPackages/shopperResponse', () => {
  it('return orders', (done) => {
    request(app)
      .get('/api/personalShopperPackages/shopperResponse')
      .send({
        payment_gateway_name: 'wire',
        hdn_reference_code: 'P646788',
      })
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('GET /api/personalShopperPackages', () => {
  it('index orders', (done) => {
    request(app)
      .get('/api/personalShopperPackages')
      .send({
        customer_id: 646,
        status: 'pending',
      })
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('GET /api/personalShopperPackages/1', () => {
  it('show orders', (done) => {
    request(app)
      .get('/api/personalShopperPackages/1')
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('PUT /api/personalShopperPackages/1/unread', () => {
  it('mark as unread personalShopperPackages', (done) => {
    request(app)
      .put('/api/personalShopperPackages/1/unread')
      .send({
        admin_read: false,
      })
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('PUT /api/personalShopperPackages/1/updateOrderItem', () => {
  it('updateOrder Item in Admin personalShopperPackages', (done) => {
    request(app)
      .put('/api/personalShopperPackages/1/updateOrderItem')
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

describe('PUT /api/personalShopperPackages/1/updateShopOrder', () => {
  it('updateOrder in Admin personalShopperPackages', (done) => {
    request(app)
      .put('/api/personalShopperPackages/1/updateShopOrder')
      .send({
        status: 'processed',
        package_id: 1,
        amount_paid: 500,
        seller_invoice: {
          filename: 'x.txt',
          base64: 'aGVsbG8=',
        },
      })
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('GET /api/personalShopperPackages/cancelShopper', () => {
  it('return orders', (done) => {
    request(app)
      .get('/api/personalShopperPackages/cancelShopper')
      .send({
        invoice_code: 'P646873',
      })
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

// describe('DELETE /api/personalShopperPackages', () => {
//   it('delete personalShopperItems', (done) => {
//     request(app)
//       .delete('/api/personalShopperPackages/2/request')
//       .set('Authorization', `Bearer ${auth.access_token}`)
//       .expect('Content-Type', /json/)
//       .expect(200)
//       .then(() => {
//         done();
//       });
//   });
// });

describe('DELETE /api/personalShopperPackages', () => {
  it('delete personalShopperPackages', (done) => {
    request(app)
      .delete('/api/personalShopperPackages/3/order')
      .send({
        package_id: 1,
      })
      .set('Authorization', `Bearer ${auth.access_token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});
