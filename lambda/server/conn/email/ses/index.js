const connection = require('./connection');

connection.send = connection.sendTemplatedEmailAsync;

module.exports = connection;
