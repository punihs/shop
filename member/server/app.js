/**
 * Main application file
 */

'use strict';

import express from 'express';
import config from './config/environment';
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('star.key'),
  cert: fs.readFileSync('ssl-bundle.crt'),
};


// Setup server
var app = express();
// var server = http.createServer(app);
var server = https.createServer(options, app);
require('./config/express')(app);
require('./routes')(app);

// Start server
function startServer() {
  app.angularFullstack = server.listen(443 || config.port, config.ip, function () {
    console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
  });
}
startServer();
// Expose app
exports = module.exports = app;
