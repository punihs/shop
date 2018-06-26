
const debug = require('debug');
const useragent = require('useragent');
const bowser = require('bowser');
const geoip = require('geoip-lite');
const geohash = require('ngeohash');

const config = require('../../config/environment');
const {
  App, User, AccessToken, AuthCode, RefreshToken, Session,
} = require('../../conn/sqldb');

const log = debug('components/oauth');

const attributes = [
  'id', 'email', 'first_name', 'last_name', 'group_id', 'email', 'mobile', 'phone', 'phone_code',
];

const oAuthModel = {
  revokeToken(token) {
    log('revokeToken', JSON.stringify(token));
    return AccessToken
      .find({
        where: {
          access_token: token,
          created_at: { $gt: new Date('2017-03-23') },
        },
        attributes: ['session_id', 'user_id'],
      })
      .then((accessToken) => {
        log('accessToken', accessToken);
        if (!accessToken) return Promise.resolve({ message: 'no tokens found.' });
        if (!accessToken.session_id) return Promise.resolve({ message: 'no session_id' });
        const { session_id: sessionId, user_id: userId } = accessToken;
        const expires = new Date();
        return Promise.all([
          AccessToken.update(
            { expires },
            { where: { user_id: userId, session_id: sessionId } },
          ),
          RefreshToken.update(
            { expires },
            { where: { user_id: userId, session_id: sessionId } },
          ),
        ]);
      });
  },
  getAccessToken(bearerToken, callback) {
    log('getAccessToken', JSON.stringify(bearerToken));
    return AccessToken
      .findOne({
        where: { access_token: bearerToken.replace('h-', '') },
        attributes: ['access_token', 'expires', 'session_id', 'app_id', 'user_id'],
        raw: true,
      })
      .then((t) => {
        const token = t;
        if (!token) return callback(null, false);

        return User
          .findById(token.user_id, {
            attributes,
            raw: true,
          })
          .then((user) => {
            token.user = user;
            delete token.User;
            callback(null, token);
            return token;
          });
      })
      .catch(callback);
  },

  // serialize App accessing api
  getClient(clientId, clientSecret, callback) {
    const options = {
      where: { client_id: clientId },
      attributes: ['id', ['client_id', 'clientId'], ['redirect_uri', 'redirectUri']],
    };
    if (clientSecret) options.where.client_secret = clientSecret;

    App
      .findOne(options)
      .then((client) => {
        if (!client) return callback(null, false);
        callback(null, client.toJSON());
        return client;
      })
      .catch(callback);
  },

  grantTypeAllowed(clientId, grantType, callback) {
    callback(null, true);
  },

  getUserFromClient(clientId, clientSecret, cb) {
    const options = {
      where: { client_id: clientId },
      include: [{
        model: User,
        attributes,
      }],
      attributes: ['id', 'client_id', 'redirect_uri'],
    };
    if (clientSecret) options.where.client_secret = clientSecret;

    return App
      .find(options)
      .then((client) => {
        if (!client || !client.User) return cb(null, false);
        cb(null, client.User.toJSON());
        return client;
      }).catch(cb);
  },

  saveAccessToken(accessToken, client, expires, user, sessionId, callback) {
    log('saveAccessToken', JSON.stringify(accessToken), 'sessionId', sessionId);
    return AccessToken
      .build({ expires })
      .set('app_id', client.id)
      .set('access_token', accessToken)
      .set('user_id', user.id)
      .set('session_id', sessionId)
      .save()
      .then(token => callback(null, token))
      .catch(callback);
  },

  saveSession(req, cb) {
    const ua = req.headers['user-agent'];

    const agent = useragent.parse(ua);
    const { id: userId } = req.user;
    const session = { user_id: userId };

    if (agent) {
      Object.assign(session, {
        browser: agent.toAgent(),
        os: agent.os.toString(),
        device: agent.device.toString(),
      });
    }

    const ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress).split(',')[0];

    session.ip = ip;
    const geo = geoip.lookup(ip);
    if (geo) {
      const {
        country, region, city, ll, metro, zip,
      } = geo;
      const [latitude, longitude] = ll;
      Object.assign(session, {
        latitude,
        longitude,
        country,
        region,
        city,
        metro,
        zip,
      });
    }

    // - Detailed Logging
    // eslint-disable-next-line no-underscore-dangle
    const browser = ua ? bowser._detect(ua) : { os: 'na' };

    return Session.create(session)
      .then((saved) => {
        const options = {
          index: 'oauth',
          type: 'logs',
          body: Object.assign({
            latitude: session.latitude,
            longitude: session.longitude,
          }, browser, saved.toJSON()),
        };
        const { latitude, longitude } = session;
        if (latitude) options.body.location = geohash.encode(latitude, longitude);

        cb(null, saved.toJSON());
        return saved;
      })
      .catch(cb);
  },

  getAuthCode(authCode, callback) {
    AuthCode
      .find({
        where: { auth_code: authCode },
        attributes: ['app_id', 'expires', ['user_id', 'userId'], 'session_id', ['app_id', 'clientId']],
      })
      .then((authCodeModel) => {
        if (!authCodeModel) return callback(null, false);
        callback(null, authCodeModel.toJSON());
        return authCodeModel;
      })
      .catch(callback);
  },

  saveAuthCode(authCode, client, expires, user, sessionId, callback) {
    log('saveAuthCode: ', authCode, sessionId);
    return AuthCode
      .build({ expires })
      .set('app_id', client.id)
      .set('auth_code', authCode)
      .set('user_id', user.id)
      .set('session_id', sessionId)
      .save()
      .then(code => callback(null, code))
      .catch(callback);
  },

  getUser(username, password, callback) {
    log('getUser', username, password);
    const where = { email: username };
    return User
      .find({
        where,
        attributes,
      })
      .then((user) => {
        log('gotUser', user && user.toJSON());
        if (!user) return callback(null, false);

        if (config.env === 'test') return callback(null, user.toJSON());
        // Send mail for client login
        return user.verifyPassword(password, (err, verifiedUser) => {
          log('password verified', { err, verifiedUser });
          if (err) return callback(null, false);
          return callback(null, verifiedUser);
        });
      })
      .catch(callback);
  },

  saveRefreshToken(refreshToken, client, expires, user, sessionId, callback) {
    return RefreshToken
      .build({ expires })
      .set('app_id', client.id)
      .set('refresh_token', refreshToken)
      .set('user_id', user.id)
      .set('session_id', sessionId)
      .save()
      .then(token => callback(null, token))
      .catch(callback);
  },

  getRefreshToken(refreshToken, callback) {
    return RefreshToken
      .findOne({
        where: { refresh_token: refreshToken },
        attributes: [['app_id', 'clientId'], ['user_id', 'userId'], 'expires', 'session_id'],

        // only non suspended users should be allowed to refresh token
        include: [{ model: User, attributes: ['id'] }],
      })
      .then((refreshTokenModel) => {
        if (!refreshTokenModel) return callback(null, false);
        callback(null, refreshTokenModel.toJSON());
        return null;
      })
      .catch(callback);
  },

  generateToken(type, req, callback) {
    // reissue refreshToken if grantType is refresh_token
    if (type === 'refreshToken' && req.body.grant_type === 'refresh_token') {
      return callback(null, { refreshToken: req.body.refresh_token });
    }

    return callback(null, false);
  },
};

module.exports = oAuthModel;
