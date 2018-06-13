const aws = require('aws-sdk');
const Bluebird = require('bluebird');

const config = require('../../config/environment');

const options = {
  region: 'us-west-2',
  accessKeyId: config.AWSAccessKeyId,
  secretAccessKey: config.AWSSecretKey,
  logger: console,
};

if (config.AWSEndPoint) options.endpoint = config.AWSEndPoint;
const pulse = new aws.SES(options);
Bluebird.promisifyAll(Object.getPrototypeOf(pulse));
module.exports = pulse;

