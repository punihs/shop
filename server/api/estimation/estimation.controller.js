const debug = require('debug');

const { Estimation } = require('./../../conn/sqldb');

const log = debug('s.estimation.controller');

exports.index = (req, res, next) => {
  log('index', req.query);
  const options = {
    attributes: req.query.fl
      ? req.query.fl.split(',')
      : ['id', 'amount', 'consignment_type', 'weight', 'customer_id', 'slug'],
    limit: Number(req.query.limit) || 20,
    offset: Number(req.query.offset) || 0,
  };

  return Estimation
    .findAll(options)
    .then(estimations => res.json(estimations))
    .catch(next);
};

