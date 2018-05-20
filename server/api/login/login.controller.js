/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/login              ->  index
 * POST    /api/login              ->  create
 * GET     /api/login/:id          ->  show
 * PUT     /api/login/:id          ->  update
 * DELETE  /api/login/:id          ->  destroy
 */

const rp = require('request-promise');
const request = require('request');
const config = require('../../config/environment');
const {
  AuthCode, App, RefreshToken,
} = require('../../conn/sqldb');
const oAuthModel = require('../../components/oauth/model');

function getApp(code) {
  return AuthCode.find({ where: { auth_code: code }, include: [App] })
    .then(authCode => (authCode && authCode.App.toJSON()));
}

exports.login = (req, res, next) => {
  const { code } = req.body;
  return (code
    ? getApp(code)
    : App.findById(1))
    .then((app) => {
      const options = {
        method: 'POST',
        url: `${config.PREFIX}api.${config.DOMAIN}/oauth/token`,
        auth: {
          user: app.client_id,
          pass: app.client_secret,
        },
        resolveWithFullResponse: true,
        headers: {
          'user-agent': req.headers['user-agent'],
          'x-forwarded-for': req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        },
      };

      options.form = code
        ? { grant_type: 'authorization_code', redirect_uri: `${app.redirect_uri}`, code }
        : { grant_type: 'password', username: req.body.username, password: req.body.password };

      rp(options)
        .then(response => res.status(response.statusCode).send(response.body))
        .catch(next);
    });
};

exports.refresh = (req, res, next) => App
  .find({
    include: [{
      model: RefreshToken,
      where: { refresh_token: req.body.refresh_token },
      required: true,
    }],
  })
  .then((app) => {
    if (!app) return res.status(400).json({ message: 'Invalid Token' });
    const options = {
      url: `${config.PREFIX}api.${config.DOMAIN}/oauth/token`,
      auth: {
        user: app.client_id,
        pass: app.client_secret,
      },
      form: {
        grant_type: 'refresh_token',
        refresh_token: req.body.refresh_token,
      },
      headers: {
        'user-agent': req.headers['user-agent'],
        'x-forwarded-for': req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      },
    };
    return request
      .post(options, (err, apires, body) => {
        if (err) return next(err);
        return res.status(apires.statusCode).send(body);
      });
  });

exports.logout = (req, res, next) => oAuthModel
  .revokeToken(req.body.access_token)
  .then(update => res.status(200).json(update))
  .catch(next);
