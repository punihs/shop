/**
 * Lambda application file
 */

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const http = require('http');
const express = require('express');

const logger = require('../server/components/logger');

const expressConfig = require('./config/express');
const { env, ip, LAMBDA_PORT } = require('../server/config/environment');

const app = express();
const server = http.createServer(app);

expressConfig(app);

// Start server
function startServer() {
  return new Promise((res, rej) => {
    if (env === 'test') return res();
    return server.listen(LAMBDA_PORT, ip, (err) => {
      if (err) return rej(err);
      return res();
    });
  });
}

function connect() {
  return Promise.all([
    Promise.resolve(),
  ]).catch(err => logger.error('Error starting', err));
}

process.on('unhandledRejection', (reason, p) => {
  logger.error('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // application specific logging, throwing an error, or other logic here
});

process.on('uncaughtException', (err) => {
  logger.error('uncaughtException', err);
});

app.loadComplete = connect().then(startServer);

app.loadComplete.then(() => {
  logger.info('API: Express server listening on %d, in %s mode', LAMBDA_PORT, app.get('env'));
});
// Expose app
module.exports = app;
