/**
 * Address model events
 */
const debug = require('debug');
const { EventEmitter } = require('events');

const { Address } = require('../../conn/sqldb');

const AddressEvents = new EventEmitter();

const log = debug('s.api.address.events');

// Set max event listeners (0 == unlimited)
AddressEvents.setMaxListeners(0);

// Model events
const events = {
  afterCreate: 'save',
  afterUpdate: 'update',
  afterDestroy: 'remove',
};

function emitEvent(event) {
  log('event', event);
  return (doc) => {
    const address = doc.toJSON();
    log('doc', { address });
    AddressEvents.emit(`${event}:${address.id}`, address);
    AddressEvents.emit(event, address);
  };
}

// Register the event emitter to the model events
[...Object.keys(events)]
  .forEach((e) => {
    const event = events[e];
    Address.hook(e, emitEvent(event));
  });

module.exports = AddressEvents;
