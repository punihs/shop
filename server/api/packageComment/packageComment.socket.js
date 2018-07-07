/**
 * Broadcast updates to client when the model changes
 */
const debug = require('debug');
const PackageCommentEvents = require('./packageComment.events');

const log = debug('s.api.packageComment.socket');


exports.register = (socket) => {
  log('register');
  const listener = (doc) => {
    const route = `/packages/${doc.package_id}/comments`;
    socket.emit(route, doc);
  };

  PackageCommentEvents.on('save', listener);

  // socket.on('disconnect', () => PackageCommentEvents
  //   .removeListener(route, listener));
};

