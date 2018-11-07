const debug = require('debug');

const { App } = require('../../../conn/sqldb');

const log = debug('oauth-authorise');

module.exports = (req, res) => {
  log('authorise');
  return App
    .find({
      where: {
        client_id: req.query.client_id,
        redirect_uri: req.query.redirect_uri,
      },
      attributes: ['id', 'name'],
    })
    .then((app) => {
      if (!app) return res.status(404).json({ error: 'Invalid Client' });
      return res.json(app);
    })
    .catch(err => res.status(400).json(err));
};
