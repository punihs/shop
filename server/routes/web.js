
module.exports = (app) => {
  app.use('/shipRequests', require('./../app/shipRequest'));
  app.use('/partners', require('./../app/partner'));
};
