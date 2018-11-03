const { getPricing } = require('./');

describe('GET /api/shippingPreference/1', () => {
  it('return shippingPreference/1', (done) => {
    getPricing({
      countryId: 226,
      weight: 1,
      type: 1,
    })
      .then(() => {
        done();
      });
  });
});
