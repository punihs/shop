const oneSignal = require('../conn/oneSignal');

const { CURRENT_EVENT } = require('../config/environment');

const reqr = require;
const providers = {
  oneSignal,
};

const templateFullName = CURRENT_EVENT || 'package_state-change';
const [object, event] = templateFullName.split('_');
const config = reqr(`../api/${object}/events/${event}`);

Object.keys(config).map(channel => config[channel].map(x => providers[channel].send(x)));
