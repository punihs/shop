const api = require('../../conn/api');
const assert = require('assert');

describe('User Login GET /oauth/token', () => {
  it('respond with access tokens', (done) => {
    api.credentials.then((token) => {
      assert(JSON.parse(token) instanceof Object, 'should be a object');
      done();
    });
  });
});
