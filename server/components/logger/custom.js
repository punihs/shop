const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

const { root, NODE_ENV } = require('../../config/environment');

const logger = new winston.Logger({
  transports: [
    new DailyRotateFile({
      name: 'error-file',
      datePattern: '.yyyy-MM-dd.log',
      filename: `${root}/logs/ps/ps`,
      message: 'testing logger message',
    }),
  ],
});

if (NODE_ENV !== 'production') logger.add(winston.transports.Console);

module.exports = logger;
