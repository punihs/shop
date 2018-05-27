const assert = require('assert');

const getPrice = require('./eco.js');

// Tests are hierarchical. Here we define a test suite for our calculator.
describe('dtdc economy price Tests', () => {
  it('less than or equal to 5 kg | not available', (done) => {
    const country = 'USA'; // All existing countries in DHL DB
    const weight = 5; // 0.1 - ~
    const type = 'nondoc';
    const price = getPrice({
      country,
      weight,
      type,
    });

    const actual = null;

    assert.equal(JSON.stringify(actual), JSON.stringify(price));
    done();
  });

  it('dtdceco available only in usa', (done) => {
    const country = 'UAE'; // All existing countries in DHL DB
    const weight = 5; // 0.1 - ~
    const type = 'nondoc';
    const price = getPrice({
      country,
      weight,
      type,
    });

    const actual = null;

    assert.equal(JSON.stringify(actual), JSON.stringify(price));
    done();
  });


  it('us nondoc 6kg', (done) => {
    const country = 'US'; // All existing countries in DHL DB
    const weight = 6; // 0.1 - ~
    const type = 'nondoc';
    const price = getPrice({
      country,
      weight,
      type,
    });

    const actual = 430 * 6;

    assert.equal(JSON.stringify(actual), JSON.stringify(price));
    done();
  });

  it('us nondoc 10kg', (done) => {
    const country = 'US'; // All existing countries in DHL DB
    const weight = 10; // 0.1 - ~
    const type = 'nondoc';
    const price = getPrice({
      country,
      weight,
      type,
    });

    const actual = 430 * 10;

    assert.equal(JSON.stringify(actual), JSON.stringify(price));
    done();
  });
});
