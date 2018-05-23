/**
 * Main application file
 */

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const http = require('http');
const express = require('express');

const expressConfig = require('./config/express');
const { env, ip, port } = require('./config/environment');

const db = require('./conn/sqldb');

// Setup server
const log = console;
const app = express();
const server = http.createServer(app);
expressConfig(app);

// Start server
function startServer() {
  return new Promise((res, rej) => {
    if (env === 'test') return res();
    return server.listen(port, ip, (err) => {
      if (err) return rej(err);
      return res();
    });
  });
}

function connect() {
  return Promise.all([
    db.sequelize.authenticate(),
  ]).catch(err => log.log('Error starting', err));
}

process.on('unhandledRejection', (reason, p) => {
  log.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // application specific logging, throwing an error, or other logic here
});

process.on('uncaughtException', (err) => {
  log.log('uncaughtException', err);
});

app.loadComplete = connect().then(startServer);

app.loadComplete.then(() => {
  log.log('API: Express server listening on %d, in %s mode', port, app.get('env'));
});
// Expose app
module.exports = app;
