const hookshot = require('./shipment.hookshot');

const PAYMENT_REQUESTED = 16;

describe('POST /api/shipments/notifications', () => {
  it('send Shipment emails', (done) => {
    hookshot.stateChange({
      nextStateId: PAYMENT_REQUESTED,
      nextStateName: 'PAYMENT_REQUESTED',
      packages: [{
        id: 1,
        invoice_code: 'AMZ123',
        order_code: 'PKG123',
        Store: {
          name: 'Amazon',
        },
        weight: 1,
        tracking_number: 'A123GGH',
        created_at: '2018-08-20',
      }],
      paymentGateway: {
        name: 'wire',
      },
      customer: {
        name: 'Mr. Abhinav Mishra',
        first_name: 'Abhinav',
        virtual_address_code: 'SHPR12-182',
        email: 'tech.shoppre@gmail.com',
      },
      actingUser: {
        first_name: 'Saneel',
        last_name: 'E S',
        email: 'support@shoppre.com',
      },
      address: {
        line1: '314 Euphoria Circle',
        line2: '314 Euphoria Circle',
        city: 'Cary, NC',
        state: 'florida',
        country: 'United states',
        pincode: '560008',
        phone: '8970972343',
      },
      ENV: {
        URLS_PARCEL: 'http://parcel.shoppre.test',
        URLS_WWW: 'http://www.shoppre.test',
      },
      shipment: {
        id: 9,
        order_code: 'DH6677889',
        customer_name: 'MEENA',
        address: 2,
        phone: 789890082990,
        packages_count: 5,
        final_weight: 10,
        estimated_amount: '7000',
        final_amount: '10000',
        created_by: 1,
        tracking_code: '1234567H',
        shipping_carrier: 'DHL',
        dispatch_date: '2018-08-20',
        customer_id: 646,
        value_amount: '10000',
        delivered_date: '2018-08-20',
      },
    })
      .then(() => {
        done();
      });
  });
});
