const auth = require('./auth');
const requestPromise = require('request-promise');
const RequestPromiseMiddlewareFramework = require('request-promise-middleware-framework');

const { env } = require('../../config/environment');

const { log } = console;

const api = {
  token: null,
  debug: env !== 'production',
  get credentials() {
    if (!this.token) return auth('client_credentials');
    return Promise.resolve(this.token);
  },
};

function middleware(options, callback, next) {
  if (api.debug) log(options.uri);
  if (options.uri.startsWith('/')) {
    Object.assign(options.headers, { authorization: `Bearer ${api.credentials.access_token}` });
  }
  next(options, callback);
}

const rpMiddlewareFramework = new RequestPromiseMiddlewareFramework(requestPromise, middleware);
const rp = rpMiddlewareFramework.getMiddlewareEnabledRequestPromise();

api.rp = rp;

module.exports = api;
