'use strict';
/*eslint no-process-env:0*/

// Production specific configuration
// =================================
const log = console;
module.exports = {
  // Server IP
  ip: process.env.OPENSHIFT_NODEJS_IP
    || process.env.ip
    || undefined,

  // Server port
  port: process.env.OPENSHIFT_NODEJS_PORT
    || process.env.PORT
    || 8080,

  PREFIX: process.env.PREFIX,
  DOMAIN: process.env.DOMAIN,
  // Sequelize connection opions
  smtp: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    ignoreTLS: process.env.SMTP_IGNORETLS === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  },
};
