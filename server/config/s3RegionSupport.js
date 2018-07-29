const geoip = require('geoip-lite');

const { env, PREFIX } = require('../config/environment');

const regionsMap = {
  DEFAULT: 'us-west-2',
  IN: 'ap-south-1',
};

module.exports = () => (req, res, next) => {
  const ipAddress = req.query.ip || req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;

  const s3Region = regionsMap[(geoip.lookup(ipAddress) || {}).country] || regionsMap.DEFAULT;
  req.s3BaseUrl = `${PREFIX}s3.${s3Region}.amazonaws.${env !== 'production' ? 'test' : 'com'}`;

  next();
};
