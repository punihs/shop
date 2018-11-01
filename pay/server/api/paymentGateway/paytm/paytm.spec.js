const request = require('supertest');
const app = require('./../../../app');

describe('get /api/paytm', () => {
  it('return api/paytm', (done) => {
    request(app)
      .get('/api/paytm/')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});

describe('get /api/paytm/response', () => {
  it('return api/paytm/response', (done) => {
    request(app)
      .get('/api/paytm/response')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});
describe('get /api/paytm/verify_checksum', () => {
  it('return api/paytm/response', (done) => {
    request(app)
      .post('/api/paytm/verify_checksum')
      .send({
        ORDERID: 'ORDER00006',
        MID: 'INDLLP22228431438570',
        TXNID: '20180805111212800110168204833000014',
        TXNAMOUNT: '3.00',
        PAYMENTMODE: 'NB',
        CURRENCY: 'INR',
        TXNDATE: '2018-08-05 15:31:27.0',
        STATUS: 'TXN_SUCCESS',
        RESPCODE: '01',
        RESPMSG: 'Txn Success',
        GATEWAYNAME: 'ICICI',
        BANKTXNID: '1507381688',
        BANKNAME: 'ICICI',
        CHECKSUMHASH: 'D+3q6dfPLVEUWRLSmk+y30DTpkOilTyFSCctwMB2jqt6/e/bR+Ez+EI86FPhmz0Hm38DoVb7a/szqfUW+I6urXbKXr40yNNT826Im9F4rHI=',
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .then(() => {
        done();
      });
  });
});
