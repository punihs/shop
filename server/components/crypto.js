const crypto = require('crypto');

const { APP_KEY } = require('../config/environment');

exports.encrypt = async () => {
  const hmac = crypto.createHmac('sha256', APP_KEY);
  const signed = hmac.update(Buffer.from(APP_KEY, 'utf-8')).digest('base64');
  return signed;
};
