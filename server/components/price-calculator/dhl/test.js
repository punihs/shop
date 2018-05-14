/** *
 * factors doc will become non doc after doc limits
 * @type {string}
 */

const getPrice = require('../dhl/getPrice');
const assert = require('assert');


describe('DHL Calculator Tests', () => {
  it('US 30Kg, nondoc', (done) => {
    const country = 'US'; // All existing countries in DHL DB

    const weight = 30; // 0.1 - ~

    const type = 'nondoc'; // doc | nondoc


    const price = getPrice({
      country,
      weight,
      type,
    });
    const actual = 8250;
    assert.equal(price, actual);
    // Invoke done when the test is complete.
    done();
  });
});

