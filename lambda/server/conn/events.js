const debug = require('debug');
const ses = require('../../../engage/server/conn/email/ses');
const whatsapp = require('./whatsapp');

const { CURRENT_EVENT } = require('../config/environment');

const reqr = require;
const providers = {
  ses,
  whatsapp,
};

const templateFullName = CURRENT_EVENT || 'package_state-change';
const [object, event] = templateFullName.split('_');
const log = debug('emails-events');

const fire = (options = reqr(`../../api/${object}/events/${event}`)) => {
  log('event.fire', options);
  return Promise
    .all(Object
      .keys(options)
      .reduce((nxt, channel) => {
        const instances = options[channel];
        const promises = instances
          .map((notification) => {
            const service = providers[channel];
            log('service', channel);
            return service.send(notification);
          });

        return nxt.concat(promises);
      }, []));
};

exports.fire = fire;
exports.cmd = fire;

