const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const Sentry = require('winston-raven-sentry');

const { root, NODE_ENV, SENTRY_DSN } = require('../../config/environment');

const logger = new winston.Logger({
  transports: [
    new DailyRotateFile({
      name: 'error-file',
      datePattern: '.yyyy-MM-dd.log',
      filename: `${root}/logs/error`,
    }),
    new Sentry({
      dsn: NODE_ENV === 'production' && SENTRY_DSN,
      install: true,
      config: { environment: NODE_ENV, release: '@@_RELEASE_' },
    }),
  ],
});

if (NODE_ENV !== 'production') logger.add(winston.transports.Console);

module.exports = logger;
