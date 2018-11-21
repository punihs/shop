/**
 * Broadcast updates to client when the model changes
 */
const PackageCommentEvents = require('./comment.events');

const map = {
  1: 'packages',
  2: 'shipments',
};

exports.register = (socket) => {
  const listener = (doc) => {
    const route = `/${map[doc.type]}/${doc.object_id}/comments`;
    socket.emit(route, doc);
  };

  PackageCommentEvents.on('save', listener);
};

