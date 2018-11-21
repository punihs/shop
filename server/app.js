/**
 * Main application file
 */

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const http = require('http');
const express = require('express');
const socket = require('socket.io');

const socketioConfig = require('./config/socketio');
const logger = require('./components/logger');

const expressConfig = require('./config/express');
const { env, ip, port } = require('./config/environment');

const db = require('./conn/sqldb');

// Setup server
const app = express();
const server = http.createServer(app);

const socketio = socket(server, {
  serveClient: true,
});

socketioConfig(socketio, db);
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
    db.sequelize.query('update socket_sessions set is_online=false'),
  ]).catch(err => logger.error('Error starting', err));
}

process.on('unhandledRejection', (reason, p) => {
  logger.error({ m: 'Unhandled Rejection at: Promise', p, reason });
});

process.on('uncaughtException', (err) => {
  logger.error({ m: 'uncaughtException', err });
});

app.loadComplete = connect().then(startServer);

app.loadComplete.then(() => {
  logger.info('API: Express server listening on %d, in %s mode', port, app.get('env'));
});

// Expose app
module.exports = app;
