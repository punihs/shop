
const getPrice = require('./fedex');
const assert = require('assert');

describe('DTDC FEDEX Calculator Tests', () => {
  it('USA 0.5Kg, doc', (done) => {
    const country = 'United States Of America'; // All existing countries in DHL DB
    const weight = 0.5; // 0.1 - ~
    const type = 'doc';
    const price = getPrice({
      country,
      weight,
      type,
    });

    const actual = 1004;
    assert.equal(price, actual);
    // Invoke done when the test is complete.
    done();
  });

  it('USA 1Kg, doc', (done) => {
    const country = 'United States Of America'; // All existing countries in DHL DB
    const weight = 1; // 0.1 - ~
    const type = 'doc';
    const price = getPrice({
      country,
      weight,
      type,
    });

    const actual = 1157;
    assert.equal(price, actual);
    // Invoke done when the test is complete.
    done();
  });

  it('USA 1Kg, doc', (done) => {
    const country = 'United States Of America'; // All existing countries in DHL DB
    const weight = 1; // 0.1 - ~
    const type = 'doc';
    const price = getPrice({
      country,
      weight,
      type,
    });

    const actual = 1157;
    assert.equal(price, actual);
    // Invoke done when the test is complete.
    done();
  });

  it('USA 1Kg, doc', (done) => {
    const country = 'United States Of America'; // All existing countries in DHL DB
    const weight = 1.5; // 0.1 - ~
    const type = 'doc';
    const price = getPrice({
      country,
      weight,
      type,
    });

    const actual = 1311;
    assert.equal(price, actual);
    // Invoke done when the test is complete.
    done();
  });

  it('USA 1Kg, doc', (done) => {
    const country = 'United States Of America'; // All existing countries in DHL DB
    const weight = 2; // 0.1 - ~
    const type = 'doc';
    const price = getPrice({
      country,
      weight,
      type,
    });

    const actual = 1464;
    assert.equal(price, actual);
    // Invoke done when the test is complete.
    done();
  });
  // nod doc test case
  it('USA 1Kg, doc', (done) => {
    const country = 'United States Of America'; // All existing countries in DHL DB
    const weight = 3; // 0.1 - ~
    const type = 'nondoc';
    const price = getPrice({
      country,
      weight,
      type,
    });

    const actual = 1881;
    assert.equal(price, actual);
    // Invoke done when the test is complete.
    done();
  });

  it('USA 1Kg, doc', (done) => {
    const country = 'United States Of America'; // All existing countries in DHL DB
    const weight = 3.5; // 0.1 - ~
    const type = 'nondoc';
    const price = getPrice({
      country,
      weight,
      type,
    });

    const actual = 2027;
    assert.equal(price, actual);
    // Invoke done when the test is complete.
    done();
  });
  it('USA 1Kg, doc', (done) => {
    const country = 'United States Of America'; // All existing countries in DHL DB
    const weight = 4; // 0.1 - ~
    const type = 'nondoc';
    const price = getPrice({
      country,
      weight,
      type,
    });

    const actual = 2174;
    assert.equal(price, actual);
    // Invoke done when the test is complete.
    done();
  });
  it('USA 1Kg, doc', (done) => {
    const country = 'United States Of America'; // All existing countries in DHL DB
    const weight = 6; // 0.1 - ~
    const type = 'nondoc';
    const price = getPrice({
      country,
      weight,
      type,
    });

    const actual = 2938;
    assert.equal(price, actual);
    // Invoke done when the test is complete.
    done();
  });

  it('USA 1Kg, doc', (done) => {
    const country = 'United States Of America'; // All existing countries in DHL DB
    const weight = 7.5; // 0.1 - ~
    const type = 'nondoc';
    const price = getPrice({
      country,
      weight,
      type,
    });

    const actual = 3328;
    assert.equal(price, actual);
    // Invoke done when the test is complete.
    done();
  });
  it('USA 1Kg, doc', (done) => {
    const country = 'United States Of America'; // All existing countries in DHL DB
    const weight = 8; // 0.1 - ~
    const type = 'nondoc';
    const price = getPrice({
      country,
      weight,
      type,
    });

    const actual = 3458;
    assert.equal(price, actual);
    // Invoke done when the test is complete.
    done();
  });
  it('USA 1Kg, doc', (done) => {
    const country = 'United States Of America'; // All existing countries in DHL DB
    const weight = 9.5; // 0.1 - ~
    const type = 'nondoc';
    const price = getPrice({
      country,
      weight,
      type,
    });

    const actual = 3848;
    assert.equal(price, actual);
    // Invoke done when the test is complete.
    done();
  });
  it('USA 1Kg, doc', (done) => {
    const country = 'United States Of America'; // All existing countries in DHL DB
    const weight = 14.5; // 0.1 - ~
    const type = 'nondoc';
    const price = getPrice({
      country,
      weight,
      type,
    });

    const actual = 5811;
    assert.equal(price, actual);
    // Invoke done when the test is complete.
    done();
  });

  it('USA 1Kg, doc', (done) => {
    const country = 'United States Of America'; // All existing countries in DHL DB
    const weight = 16.5; // 0.1 - ~
    const type = 'nondoc';
    const price = getPrice({
      country,
      weight,
      type,
    });

    const actual = 6478;
    assert.equal(price, actual);
    // Invoke done when the test is complete.
    done();
  });
  it('USA 1Kg, doc', (done) => {
    const country = 'United States Of America'; // All existing countries in DHL DB
    const weight = 19; // 0.1 - ~
    const type = 'nondoc';
    const price = getPrice({
      country,
      weight,
      type,
    });

    const actual = 7312;
    assert.equal(price, actual);
    // Invoke done when the test is complete.
    done();
  });
  it('USA 1Kg, doc', (done) => {
    const country = 'United States Of America'; // All existing countries in DHL DB
    const weight = 20; // 0.1 - ~
    const type = 'nondoc';
    const price = getPrice({
      country,
      weight,
      type,
    });

    const actual = 7646;
    assert.equal(price, actual);
    // Invoke done when the test is complete.
    done();
  });
});
