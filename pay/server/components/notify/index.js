const rp = require('request-promise');
const config = require('../../config/environment');

module.exports = {
  slack(text, uri = config.URLS_SLACK) {
    const options = {
      method: 'POST',
      uri,
      form: JSON.stringify({ text: text || 'Someone sending blank notification nik...' }),
    };

    return rp(options);
  },
};
