/**
 * Main application file
 */

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const http = require('http');
const express = require('express');
const socket = require('socket.io');
const monitor = require('socket.io-monitor');

const socketioConfig = require('./config/socketio');
const logger = require('./components/logger');

// const api = require('./conn/api');
// api.credentials,

const expressConfig = require('./config/express');
const { env, ip, port } = require('./config/environment');

const db = require('./conn/sqldb');

// Setup server
const { log } = console;
const app = express();
const server = http.createServer(app);

const socketio = socket(server, {
  serveClient: true,
  // path: '/socket.io-client',
});

const { emitter } = monitor.bind(socketio, { port: 9042, host: 'localhost' });

setInterval(() => {
  emitter
    .getState()
    .then((stats) => {
      log('active sockets:', stats.sockets.length, ' active rooms:', stats.rooms.length);
      const socketIds = stats.sockets.map(y => y.id);
      if (socketIds.length) {
        Promise
          .all([
            db.SocketSession
              .update({ is_online: true }, { where: { socket_id: socketIds } }),
            db.SocketSession
              .update({ is_online: false }, { where: { socket_id: { $notIn: socketIds } } }),
          ])
          .then(x => log('sessions updated', x))
          .catch(err => logger.error('socket update error', err));
      } else {
        db.sequelize.query('update socket_sessions set is_online=false');
      }
    });
}, 10000);

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
  ]).catch(err => log('Error starting', err));
}

process.on('unhandledRejection', (reason, p) => {
  log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // application specific logging, throwing an error, or other logic here
});

process.on('uncaughtException', (err) => {
  log('uncaughtException', err);
});

app.loadComplete = connect().then(startServer);

app.loadComplete.then(() => {
  log('API: Express server listening on %d, in %s mode', port, app.get('env'));
});
// Expose app
module.exports = app;
