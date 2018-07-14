/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

import config from './environment/';

export default function seedDatabaseIfNeeded() {
  if(config.seedDB) {
    console.log(config.seedDB);
  }
}
