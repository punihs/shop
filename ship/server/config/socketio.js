/**
 * Socket.io configuration
 */
const debug = require('debug');

const logger = require('../components/logger');

const comment = require('../api/comment/comment.socket');

const log = debug('s.config.socketio');

// When the user disconnects.. perform this
function onDisconnect(socket, db) {
  log('onDisconnect');
  setTimeout(() => {
    db.SocketSession
      .find({ where: { socket_id: socket.id } })
      .then((socketSession) => {
        if (!(socketSession && socketSession.is_online)) {
          socket.broadcast.emit('chat-list-response', {
            error: false,
            userDisconnected: true,
            socketId: socket.id,
          });
        }
        return socketSession.update({ is_online: false });
      })
      .catch(err => logger.error('chat offline status change error', socket.id, socket.userId, err));
  }, 1000);
}

const getChatList = (db, userId) => {
  db.User
    .findAll({
      where: {
        user_id: {
          $ne: userId,
        },
      },
    })
    .then(users => ({
      users,
      socketIds: users.map(x => x.socket_id),
    }));
};

// When the user connects.. perform  this
function onConnect(socket, db) {
  log('socket:onConnect');
  // When the client emits 'info', this listens and executes
  socket.on('info', (data) => {
    log('info', data);
    socket.log(JSON.stringify(data, null, 2));
  });

  // Insert sockets below
  comment.register(socket);
  // shipmentComment.register(socket);

  /**
   * get the user's Chat list
   */
  socket.on('chat-list', (sock) => {
    log('on:chat-list', sock.userId);
    const chatListResponse = {};

    if (sock.userId === '') {
      chatListResponse.error = true;
      chatListResponse.message = 'User does not exits.';
      this.io.emit('chat-list-response', chatListResponse);
    } else {
      db.User
        .findByid(sock.userId)
        .then(user => getChatList(db, sock.userId)
          .then((response) => {
            this.io.to(sock.id).emit('chat-list-response', {
              error: false,
              singleUser: false,
              chatList: response === null ? null : response.users,
            });

            if (response !== null) {
              const chatListIds = response.socketIds;
              chatListIds.forEach((Ids) => {
                this.io.to(Ids.socketId).emit('chat-list-response', {
                  error: false,
                  singleUser: true,
                  chatList: [user],
                });
              });
            }
          }));
    }
  });
}

module.exports = (socketio, db) => {
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
    log('new connection', s.id);
    const socket = s;
    log('socket:connection');
    socket.address = `${socket.request.connection.remoteAddress}:${socket.request.connection.remotePort}`;

    socket.connectedAt = new Date();

    const key = '_query';
    const { id } = socket;
    socket.userId = socket.request[key].userId;
    log('new connection id', id);

    if (id) {
      db.SocketSession
        .create({ socket_id: socket.id, user_id: socket.userId, is_online: true })
        .catch(err => logger.error('socket session creation error', err));
    }


    socket.log = (...data) => {
      log(`SocketIO ${socket.nsp.name} [${socket.address}]`, ...data);
    };

    // Call onDisconnect.
    socket.on('disconnect', () => {
      log('on:disconnect:');
      onDisconnect(socket, db);
      socket.log('DISCONNECTED');
    });

    // Call onConnect.
    onConnect(socket, db);
    socket.log('CONNECTED');
  });
};
