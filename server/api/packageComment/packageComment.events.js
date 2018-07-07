/**
 * PackageComment model events
 */
const debug = require('debug');
const { EventEmitter } = require('events');

const { PackageComment, User } = require('../../conn/sqldb');
const logger = require('../../components/logger');

const PackageCommentEvents = new EventEmitter();

const log = debug('s.api.packageComment.events');

// Set max event listeners (0 == unlimited)
PackageCommentEvents.setMaxListeners(0);

// Model events
const events = {
  afterCreate: 'save',
  afterUpdate: 'update',
  afterDestroy: 'remove',
};

function emitEvent(event) {
  log('event', event);
  return (doc) => {
    const packageComment = doc.toJSON();
    log('doc', { packageComment });
    User
      .findById(packageComment.user_id, {
        attributes: [
          'id', 'email', 'first_name', 'last_name', 'group_id', 'salutation', 'name',
        ],
      })
      .then((user) => {
        log('event', event);
        PackageCommentEvents.emit(event, { ...packageComment, User: user.toJSON() });
      })
      .catch(err => logger.error('PackageCommentEvents', err));
  };
}

// Register the event emitter to the model events
[...Object.keys(events)]
  .forEach((e) => {
    const event = events[e];
    PackageComment.hook(e, emitEvent(event));
  });

module.exports = PackageCommentEvents;
