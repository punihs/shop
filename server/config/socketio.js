/**
 * Socket.io configuration
 */
const debug = require('debug');

const r = require;

const log = debug('s.config.socketio');

// When the user disconnects.. perform this
function onDisconnect(/* socket */) {}

// When the user connects.. perform  this
function onConnect(socket) {
  log('socket:onConnect');
  // When the client emits 'info', this listens and executes
  socket.on('info', (data) => {
    log('info', data);
    socket.log(JSON.stringify(data, null, 2));
  });

  // Insert sockets below
  r('../api/address/address.socket').register(socket);
}

module.exports = (socketio) => {
  log('socket:public');
  // socket.io (v1.x.x) is powered by debug.
  // In order to see all the debug output,
  // set DEBUG (in server/config/local.env.js) to including the desired scope.
  //
  // ex: DEBUG: "http*,socket.io:socket"

  // We can authenticate socket.io users and access their token through socket.decoded_token
  //
  // 1. You will need to send the token in `client/components/socket/socket.service.js`
  //
  // 2. Require authentication here:
  // socketio.use(require('socketio-jwt').authorize({
  //   secret: config.secrets.session,
  //   handshake: true
  // }));

  socketio.on('connection', (s) => {
    const socket = s;
    log('socket:connection');
    socket.address = `${socket.request.connection.remoteAddress}:${socket.request.connection.remotePort}`;

    socket.connectedAt = new Date();

    socket.log = (...data) => {
      log(`SocketIO ${socket.nsp.name} [${socket.address}]`, ...data);
    };

    // Call onDisconnect.
    socket.on('disconnect', () => {
      log('---------------disconnect');
      onDisconnect(socket);
      socket.log('DISCONNECTED');
    });

    // Call onConnect.
    onConnect(socket);
    socket.log('CONNECTED');
  });
};
