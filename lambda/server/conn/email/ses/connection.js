const Bluebird = require('bluebird');
const aws = require('aws-sdk');

const config = require('../../../config/environment');

const ses = new aws.SES({
  region: 'us-west-2',
  endpoint: config.AWSEndPoint,
  apiVersion: '2010-12-01',
  accessKeyId: config.AWSAccessKeyId,
  secretAccessKey: config.AWSSecretKey,
});

Bluebird.promisifyAll(Object.getPrototypeOf(ses));

module.exports = ses;

