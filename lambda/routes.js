/**
 * Lambda application routes
 */
const express = require('express');
const { name, version } = require('../package.json');

const logger = require('../server/components/logger');

// - Routers
const pkg = require('../server/api/package/lambda.js');
const user = require('../server/api/user/lambda.js');

module.exports = (app) => {
  app.get('/api/health', (req, res) => res.json({ name, version }));
  app.use('/api/packages', pkg);
  app.use('/api/users', user);
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
