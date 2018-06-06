/**
 * Broadcast updates to client when the model changes
 */
const debug = require('debug');
const AddressEvents = require('./address.events');

const log = debug('s.api.address.socket');

// Model events to emit
const events = ['save', 'remove'];

function createListener(event, socket) {
  log('createListener', event);
  return (doc) => {
    log('createListener', event, doc);
    socket.emit(event, doc);
  };
}

function removeListener(event, listener) {
  log('removeListener', event);
  return () => {
    AddressEvents.removeListener(event, listener);
  };
}


exports.register = (socket) => {
  log('register');
  // Bind model events to socket events
  for (let i = 0, eventsLength = events.length; i < eventsLength; i += 1) {
    const event = events[i];
    const listener = createListener(`address:${event}`, socket);

    AddressEvents.on(event, listener);
    socket.on('disconnect', removeListener(event, listener));
  }
};

