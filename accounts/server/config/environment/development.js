'use strict';
/*eslint no-process-env:0*/

// Development specific configuration
// ==================================
const log = console;
module.exports = {
  PREFIX: process.env.PREFIX,
  DOMAIN: process.env.DOMAIN,
  // Do not Seed database on startup
  seedDB: false,
};
