const rp = require('request-promise');
const {
  URLS_API, MASTER_TOKEN,
} = require('../../../config/environment');

module.exports = (username) => {
  console.log({ MASTER_TOKEN, URLS_API });
  return rp({
    method: 'POST',
    uri: `${URLS_API}/authorise?token=${MASTER_TOKEN}`,
    form: {
      grant_type: 'loginAs',
      username,
    },
  });
};
