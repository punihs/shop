const shipRequest = require('./../app/shipRequest');
const partner = require('./../app/partner');

module.exports = (app) => {
  app.use('/shipRequests', shipRequest);
  app.use('/partners', partner);
};
