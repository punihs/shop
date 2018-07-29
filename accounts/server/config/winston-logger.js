//{ error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }
const winston = require('winston');
const fs = require('fs');
const moment = require('moment');
const logDir = 'logs';

winston.emitErrs = true;

if(!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logger = new winston.Logger({
  transports: [
    new (winston.transports.Console)({
      name: 'console',
      level: 'debug',
      silent: false,
      timestamp() {
        return moment().format('YYYY-MM-DD hh:mm:ss');
      },
      formatter(options) {
        return options.timestamp() + ' ' + options.level.toUpperCase().substring(0, 3) + ' :: ' + (options.message ? options.message : '');
      }
    }),
    new winston.transports.File({
      name: 'file',
      level: 'info',
      silent: false,
      filename: 'logs/all-logs.log',
      json: false,
      maxsize: 5242880, //5MB
      maxFiles: 5,
      timestamp() {
        return moment().format('YYYY-MM-DD hh:mm:ss');
      },
      formatter(options) {
        return options.timestamp() + ' ' + options.level.toUpperCase().substring(0, 3) + ' :: ' + (options.message ? options.message : '');
      }
    })
  ],
  exitOnError: false
});

module.exports = logger;
