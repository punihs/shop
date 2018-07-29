const sequelize = require('sequelize');
const { Store, Package } = require('./../../conn/sqldb');

exports.index = async (req, res, next) => {
  const options = {
    where: {},
    attributes: req.query.fl
      ? req.query.fl.split(',')
      : ['id', 'name', 'type', 'logo', 'slug'],
    limit: Number(req.query.limit) || 20,
    offset: Number(req.query.offset) || 0,
  };

  let popularStores = [];
  if (req.query.type === 'popular') {
    popularStores = await Package.findAll({
      attributes: ['store_id', [sequelize.fn('count', 1), 'cnt']],
      limit: Number(req.query.limit) || 10,
      group: ['store_id'],
      raw: true,
    });

    if (popularStores && popularStores.length) {
      options.where.id = popularStores.map(x => x.store_id);
    }
  }

  return Store
    .findAll(options)
    .then(stores => res.json(stores))
    .catch(next);
};

exports.show = (req, res, next) => {
  const { id } = req.params;
  const options = {
    attributes: req.query.fl
      ? req.query.fl.split(',')
      : ['id', 'name', 'type', 'logo', 'slug'],
  };

  return Store
    .findById(id, options)
    .then(store => res.json(store))
    .catch(next);
};
