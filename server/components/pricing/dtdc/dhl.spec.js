const assert = require('assert');

const getPrice = require('./dhl.js');

// Tests are hierarchical. Here we define a test suite for our calculator.
describe('DTDC DHL price Tests', () => {
  [
    ['US', 'doc', 0.5, 2015],
    ['US', 'doc', 1, 2618],
    ['US', 'doc', 2.5, 4428],
    ['US', 'nondoc', 0.5, 2616],
    ['US', 'nondoc', 2.5, 5319],
    ['US', 'nondoc', 20, 23337],
    ['US', 'nondoc', 21, 23859],
    ['US', 'nondoc', 30, 28557],
    ['US', 'nondoc', 31, 28507],
    ['US', 'nondoc', 71, 46236],
    ['US', 'nondoc', 101, 58329],
    ['US', 'nondoc', 300, 144297],

  ]
    .map(([country, type, weight, actual]) => it(`${country} ${weight} ${type}kg`, (done) => {
      assert.equal(actual, getPrice({
        country,
        weight,
        type,
      }));
      done();
    }));
});
