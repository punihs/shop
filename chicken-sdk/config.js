const path = require('path');

module.exports = {
  root: path.normalize(`${__dirname}/..`),
  CURRENT_EMAIL: 'package_state-change',
  project: 'lambda',
  EMAIL_SOURCE: 'support@shoppre.com',
  EMAIL_TO: 'test@test.com',
};
