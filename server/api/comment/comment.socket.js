/**
 * Broadcast updates to client when the model changes
 */
const debug = require('debug');
const PackageCommentEvents = require('./comment.events');

const log = debug('s.api.packageComment.socket');
const map = {
  1: 'packages',
  2: 'shipments',
};

exports.register = (socket) => {
  log('register');
  const listener = (doc) => {
    const route = `/${map[doc.type]}/${doc.object_id}/comments`;
    socket.emit(route, doc);
  };

  PackageCommentEvents.on('save', listener);

  // socket.on('disconnect', () => PackageCommentEvents
  //   .removeListener(route, listener));
};

