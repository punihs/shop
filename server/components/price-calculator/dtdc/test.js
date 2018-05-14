/** *
 * factors doc will become non doc after doc limits
 * @type {string}
 */

const getPrice = require('./index');
const assert = require('assert');

describe('DHL Calculator Tests', () => {
  it('US 2Kg, nondoc', (done) => {
    const country = 'US'; // All existing countries in DHL DB
    const weight = 2; // 0.1 - ~
    const type = 'nondoc';
    const price = getPrice({
      country,
      weight,
      type,
    });

    const actual = 796 + (307 * 3);
    assert.equal(price, actual);
    // Invoke done when the test is complete.
    done();
  });
  ['doc', 'nondoc'].forEach((type) => {
    it(`US 0.25Kg,${type}`, (done) => {
      const country = 'US'; // All existing countries in DHL DB
      const weight = 0.25; // 0.1 - ~
      const price = getPrice({
        country,
        weight,
        type,
      });

      const actual = 705;
      assert.equal(price, actual);
      // Invoke done when the test is complete.
      done();
    });

    it(`US 0.5Kg,${type}`, (done) => {
      const country = 'US'; // All existing countries in DHL DB
      const weight = 0.5; // 0.1 - ~
      const price = getPrice({
        country,
        weight,
        type,
      });

      const actual = 755;
      assert.equal(price, actual);
      // Invoke done when the test is complete.
      done();
    });


    it(`US 1Kg,${type}`, (done) => {
      const country = 'US'; // All existing countries in DHL DB
      const weight = 1; // 0.1 - ~

      const price = getPrice({
        country,
        weight,
        type,
      });

      const actual = 755 * 2;
      assert.equal(price, actual);
      // Invoke done when the test is complete.
      done();
    });

    it(`US 2Kg,${type}`, (done) => {
      const country = 'US'; // All existing countries in DHL DB
      const weight = 2; // 0.1 - ~

      const price = getPrice({
        country,
        weight,
        type,
      });

      const actual = 755 * 4;
      assert.equal(price, actual);
      // Invoke done when the test is complete.
      done();
    });

    it(`US 2.5Kg,${type}`, (done) => {
      const country = 'US'; // All existing countries in DHL DB
      const weight = 2.5; // 0.1 - ~
      const price = getPrice({
        country,
        weight,
        type,
      });

      const actual = 796 + (4 * 307);
      assert.equal(price, actual);
      // Invoke done when the test is complete.
      done();
    });

    it(`US 3Kg,${type}`, (done) => {
      const country = 'US'; // All existing countries in DHL DB
      const weight = 3; // 0.1 - ~
      const price = getPrice({
        country,
        weight,
        type,
      });

      const actual = 796 + (5 * 307);
      assert.equal(price, actual);
      // Invoke done when the test is complete.
      done();
    });
    it(`US 5Kg,${type}`, (done) => {
      const country = 'US'; // All existing countries in DHL DB
      const weight = 5; // 0.1 - ~

      const price = getPrice({
        country,
        weight,
        type,
      });

      const actual = 796 + (9 * 307);
      assert.equal(price, actual);
      // Invoke done when the test is complete.
      done();
    });
    it(`US 6Kg,${type}`, (done) => {
      const country = 'US'; // All existing countries in DHL DB
      const weight = 6; // 0.1 - ~
      const price = getPrice({
        country,
        weight,
        type,
      });

      const actual = 513 * 6;
      assert.equal(price, actual);
      // Invoke done when the test is complete.
      done();
    });
    it(`US 10Kg,${type}`, (done) => {
      const country = 'US'; // All existing countries in DHL DB
      const weight = 10; // 0.1 - ~
      const price = getPrice({
        country,
        weight,
        type,
      });

      const actual = 513 * 10;
      assert.equal(price, actual);
      // Invoke done when the test is complete.
      done();
    });

    it(`US 11Kg,${type}`, (done) => {
      const country = 'US'; // All existing countries in DHL DB
      const weight = 11; // 0.1 - ~

      const price = getPrice({
        country,
        weight,
        type,
      });

      const actual = 492 * 11;
      assert.equal(price, actual);
      // Invoke done when the test is complete.
      done();
    });
  });
});
