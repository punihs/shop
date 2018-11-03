/**
 * Comment model events
 */
const debug = require('debug');
const { EventEmitter } = require('events');

const { Comment, User } = require('../../conn/sqldb');
const logger = require('../../components/logger');

const CommentEvents = new EventEmitter();

const log = debug('s.api.comment.events');

// Set max event listeners (0 == unlimited)
CommentEvents.setMaxListeners(0);

// Model events
const events = {
  afterCreate: 'save',
  afterUpdate: 'update',
  afterDestroy: 'remove',
};

function emitEvent(event) {
  log('event', event);
  return (doc) => {
    const comment = doc.toJSON();
    log('doc', { comment });
    User
      .findById(comment.user_id, {
        attributes: [
          'id', 'email', 'first_name', 'last_name', 'group_id', 'salutation', 'name',
        ],
      })
      .then((user) => {
        log('event', event);
        CommentEvents.emit(event, { ...comment, User: user.toJSON() });
      })
      .catch(err => logger.error('CommentEvents', err));
  };
}

// Register the event emitter to the model events
[...Object.keys(events)]
  .forEach((e) => {
    const event = events[e];
    Comment.hook(e, emitEvent(event));
  });

module.exports = CommentEvents;
