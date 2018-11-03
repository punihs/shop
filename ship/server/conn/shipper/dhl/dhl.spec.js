const dhl = require('./index');
const assert = require('assert');
const sinon = require('sinon');

const { SHIPPING_PARTNERS: { DHL } } = require('../../../config/constants/objects');
const fakeResponse = require('../../shipper/dhl/sample');
const shipper = require('../../shipper');

describe('dhl lastStatus error', () => {
  it('return invalid shipment error', (done) => {
    dhl
      .lastStatus('2171468460')
      .catch(() => done());
  });
});

describe('dhl lastStatus', () => {
  before((done) => {
    sinon
      .stub(shipper[DHL], 'status').callsFake(() => Promise.resolve(fakeResponse));
    done();
  });

  it('return lastStatus', (done) => {
    dhl.lastStatus('6422614100')
      .then((status) => {
        assert(status.status.message === 'Delivered - Signed for by', 'should return delivered');
        done();
      });
  });
});

