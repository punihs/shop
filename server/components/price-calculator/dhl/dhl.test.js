/** *
 * factors doc will become non doc after doc limits
 * @type {string}
 */

const getPrice = require('./getPrice');

const assert = require('assert');

// Tests are hierarchical. Here we define a test suite for our calculator.
describe('dtdc dhl price Tests', () => {
  it('us doc 0.5kg', (done) => {
    const country = 'US'; // All existing countries in DHL DB
    const weight = 0.5; // 0.1 - ~
    const type = 'doc'; // doc | nondoc

    const price = getPrice({
      country,
      weight,
      type,
    });

    const actual = 600;

    assert.equal(actual, price);
    done();
  });

  it('us doc 1kg', (done) => {
    const country = 'US'; // All existing countries in DHL DB
    const weight = 1; // 0.1 - ~
    const type = 'doc'; // doc | nondoc

    const price = getPrice({
      country,
      weight,
      type,
    });

    const actual = 700;

    assert.equal(actual, price);
    done();
  });

  it('us doc 2kg', (done) => {
    const country = 'US'; // All existing countries in DHL DB
    const weight = 2; // 0.1 - ~
    const type = 'doc'; // doc | nondoc

    const price = getPrice({
      country,
      weight,
      type,
    });

    const actual = 800;

    assert.equal(actual, price);
    done();
  });

  it('us nondoc 0.5kg', (done) => {
    const country = 'US'; // All existing countries in DHL DB
    const weight = 0.5; // 0.1 - ~
    const type = 'nondoc'; // doc | nondoc

    const price = getPrice({
      country,
      weight,
      type,
    });

    const actual = 600;

    assert.equal(actual, price);
    done();
  });
});

