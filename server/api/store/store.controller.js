const sequelize = require('sequelize');
const { Store, Package } = require('./../../conn/sqldb');

exports.index = async (req, res, next) => {
  try {
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

    const stores = await Store
      .findAll(options);

    return res.json(stores);
  } catch (err) {
    return next(err);
  }
};

exports.show = async (req, res, next) => {
  try {
    const { id } = req.params;

    const store = await Store
      .findById(id, {
        attributes: req.query.fl
          ? req.query.fl.split(',')
          : ['id', 'name', 'type', 'logo', 'slug'],
      });

    return res.json(store);
  } catch (err) {
    return next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name } = req.body;

    const store = await Store
      .findOne({
        attributes: ['id', 'name'],
        where: { name },
      });

    if (store) return res.json({ id: store.id, name });

    const { id } = await Store
      .create({ name });

    return res.json({ id, name });
  } catch (err) {
    return next(err);
  }
};
