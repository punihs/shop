/**
 * Main application routes
 */

'use strict';

import errors from './components/errors';
import path from 'path';

export default function(app) {
  // Insert routes below

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components)/*')
   .get(errors[404]);


  app.use((e, req, res, next) => { // eslint-disable-line no-unused-vars
    const err = e;
    const { body, headers, user } = req;

    logger.error(err.message, err, {
      url: req.originalUrl,
      body,
      headers,
      user,
    });

    if(err && err.code) return res.status(500).json(err);
    return res.status(500).json({ message: err.message, stack: err.stack });
  });

  app.route('/*')
    .get((req, res) => {
      res.sendFile(path.resolve(`${app.get('appPath')}/index.html`));
    });
}
