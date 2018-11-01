/**
 * Lambda application routes
 */
const { name, version } = require('../package.json');

const logger = require('./components/logger');

// - Routers
const emailTemplate = require('./api/emailTemplate');
const notificationSubscription = require('./api/notificationSubscription');
const emailPreference = require('./api/emailPreference');

module.exports = (app) => {
  app.get('/api/health', (req, res) => res.json({ name, version }));
  app.use('/api/notificationSubscriptions', notificationSubscription);
  app.use('/api/emailTemplates', emailTemplate);
  app.use('/api/emailPreferences', emailPreference);
  app.use(logger.transports.sentry.raven.errorHandler());

  // All undefined asset or api routes should return a 404
  app.use((e, req, res, next) => {
    if (!next) return null;
    const err = e;
    const { body, headers, user: u } = req;

    logger.error(err.message, err, {
      url: req.originalUrl,
      body,
      headers,
      user: u,
    });

    return res.status(500).json({ message: err.message, stack: err.stack });
  });
  app.route('/*').get((req, res) => res.status(404).json({ message: '404' }));
};
