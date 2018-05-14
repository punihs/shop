const aws = require('aws-sdk');

const config = require('../../config/environment');

const options = {
  region: 'us-west-2',
  accessKeyId: config.AWSAccessKeyId,
  secretAccessKey: config.AWSSecretKey,
  logger: console,
};

if (config.AWSEndPoint) options.endpoint = config.AWSEndPoint;

module.exports = new aws.SES(options);

