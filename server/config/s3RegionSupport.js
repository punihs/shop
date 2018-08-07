const debug = require('debug');
const geoip = require('geoip-lite');

const { env, PREFIX } = require('../config/environment');

const log = debug('server-config-s3RegionSupport');

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
  log('S3Region', s3Region);
  const devUrl = `http://s3.${s3Region}.amazonaws.test`;
  const prodUrl = `${PREFIX}s3.${s3Region}.shoppre.com.s3-website.${s3Region}.amazonaws.com`;
  req.s3BaseUrl = env !== 'production' ? devUrl : prodUrl;
  next();
};
