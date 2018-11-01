
const debug = require('debug');
const {
  User, AccessToken,
} = require('../../conn/sqldb');

const log = debug('components/oauth');

const attributes = [
  'id', 'email', 'first_name', 'last_name', 'group_id', 'email', 'phone',
  'salutation',
];

const oAuthModel = {
  getAccessToken(bearerToken, callback) {
    log('getAccessToken', JSON.stringify(bearerToken));
    return AccessToken
      .findOne({
        where: { access_token: bearerToken.replace('h-', '') },
        attributes: ['access_token', 'expires', 'session_id', 'app_id', ['auth_id', 'user_id']],
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
};

module.exports = oAuthModel;
