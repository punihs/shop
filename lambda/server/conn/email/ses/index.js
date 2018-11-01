const connection = require('./connection');

const email = {
  quarc: connection,
  sendTemplatedEmail: connection.sendTemplatedEmail,
  sendTemplatedEmailAsync: connection.sendTemplatedEmailAsync,
  send: connection.sendTemplatedEmailAsync,
};

module.exports = email;
