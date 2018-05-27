const assert = require('assert');

const getPrice = require('./getPrice.js');

// Tests are hierarchical. Here we define a test suite for our calculator.
describe('dhl price Tests', () => {
  it('us doc 0.5kg', (done) => {
    const country = 'US'; // All existing countries in DHL DB
    const weight = 0.5; // 0.1 - ~
    const type = 'doc';
    const price = getPrice({
      country,
      weight,
      type,
      providers: ['dhl', 'dtdcdhl', 'dtdcfedex', 'dtdc'],
    });

    const actual = [{
      base_cost_from_upstream: 600,
      base_cost: 750,
      gst: 135,
      fuel_surcharge: 165,
      final_cost: 900,
    }, {
      base_cost_from_upstream: 2015,
      base_cost: 2518.75,
      gst: 454,
      fuel_surcharge: 555,
      final_cost: 3024,
    }, {
      base_cost_from_upstream: 1004,
      base_cost: 1255,
      gst: 226,
      fuel_surcharge: 277,
      final_cost: 1507,
    }, {
      base_cost_from_upstream: 755,
      base_cost: 943.75,
      gst: 170,
      fuel_surcharge: 208,
      final_cost: 1133,
    }];


    assert.equal(JSON.stringify(actual), JSON.stringify(price));
    done();
  });
});
