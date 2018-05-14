const assert = require('assert');

const getPrice = require('./dhl.js');

// Tests are hierarchical. Here we define a test suite for our calculator.
describe('dtdc dhl price Tests', () => {
  it('us doc 0.5kg', (done) => {
    const country = 'US'; // All existing countries in DHL DB
    const weight = 0.5; // 0.1 - ~
    const type = 'doc';
    const price = getPrice({
      country,
      weight,
      type,
    });

    const actual = 2015;
    assert.equal(actual, price);
    done();
  });


  ['doc', 'nondoc'].forEach((type) => {
    it(`US doc 0.5Kg,${type}`, (done) => {
      const country = 'US'; // All existing countries in DHL DB
      const weight = 0.5; // 0.1 - ~

      const price = getPrice({
        country,
        weight,
        type,
      });

      const actual = 2015;
      assert.equal(price, actual);
      done();
    });


    it('us doc 1kg', (done) => {
      const country = 'US'; // All existing countries in DHL DB
      const weight = 1; // 0.1 - ~
      const price = getPrice({
        country,
        weight,
        type,
      });

      const actual = 2618;
      assert.equal(actual, price);
      done();
    });


    it('us doc 1kg', (done) => {
      const country = 'US'; // All existing countries in DHL DB
      const weight = 1; // 0.1 - ~

      const price = getPrice({
        country,
        weight,
        type,
      });


      const actual = 2618;
      assert.equal(actual, price);
      done();
    });

    it('us doc 2.5kg', (done) => {
      const country = 'US'; // All existing countries in DHL DB
      const weight = 2.5; // 0.1 - ~

      const price = getPrice({
        country,
        weight,
        type,
      });


      const actual = 4428;
      assert.equal(actual, price);
      done();
    });


    it('us doc 2.5kg', (done) => {
      const country = 'US'; // All existing countries in DHL DB
      const weight = 2.5; // 0.1 - ~

      const price = getPrice({
        country,
        weight,
        type,
      });


      const actual = 5319;
      assert.equal(actual, price);
      done();
    });


    it('us doc 0.5kg', (done) => {
      const country = 'US'; // All existing countries in DHL DB
      const weight = 0.5; // 0.1 - ~

      const price = getPrice({
        country,
        weight,
        type,
      });

      const actual = 2616;
      assert.equal(actual, price);
      done();
    });


    it('us doc 20kg', (done) => {
      const country = 'US'; // All existing countries in DHL DB
      const weight = 20; // 0.1 - ~

      const price = getPrice({
        country,
        weight,
        type,
      });

      const actual = 23337;
      assert.equal(actual, price);
      done();
    });

    it('us doc 21kg', (done) => {
      const country = 'US'; // All existing countries in DHL DB
      const weight = 21; // 0.1 - ~

      const price = getPrice({
        country,
        weight,
        type,
      });

      const actual = 23859;
      assert.equal(actual, price);
      done();
    });


    it('us doc 30kg', (done) => {
      const country = 'US'; // All existing countries in DHL DB
      const weight = 30; // 0.1 - ~

      const price = getPrice({
        country,
        weight,
        type,
      });

      const actual = 28557;
      assert.equal(actual, price);
      done();
    });


    it('us doc 31kg', (done) => {
      const country = 'US'; // All existing countries in DHL DB
      const weight = 31; // 0.1 - ~

      const price = getPrice({
        country,
        weight,
        type,
      });

      const actual = 28507;
      assert.equal(actual, price);
      done();
    });

    it('us doc 71kg', (done) => {
      const country = 'US'; // All existing countries in DHL DB
      const weight = 71; // 0.1 - ~

      const price = getPrice({
        country,
        weight,
        type,
      });

      const actual = 46236;
      assert.equal(actual, price);
      done();
    });


    it('us doc 101kg', (done) => {
      const country = 'US'; // All existing countries in DHL DB
      const weight = 101; // 0.1 - ~

      const price = getPrice({
        country,
        weight,
        type,
      });

      const actual = 58329;
      assert.equal(actual, price);
      done();
    });


    it('us doc 300kg', (done) => {
      const country = 'US'; // All existing countries in DHL DB
      const weight = 300; // 0.1 - ~

      const price = getPrice({
        country,
        weight,
        type,
      });

      const actual = 144297;
      assert.equal(actual, price);
      done();
    });
  });
});
