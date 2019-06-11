const path = require('path');

module.exports = {
  root: path.normalize(`${__dirname}/../../../..`),
  CURRENT_EMAIL: process.env.CURRENT_EMAIL || 'shipment_state-change',
  project: 'lambda',
  EMAIL_SOURCE: 'support@shoppre.com',
  EMAIL_TO: 'tech.shoppre@gmail.com',
};
