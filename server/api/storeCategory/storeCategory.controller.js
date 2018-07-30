const debug = require('debug');

const log = debug('s.shipment.controller');

const { Store, StoreCategoryClub, StoreCategory } = require('../../conn/sqldb/index');

exports.index = async (req, res) => {
  const web = {
    where: { store_category_id: 1 },
    attributes: ['id', 'url', 'rank', 'featured', 'info', 'store_id', 'store_category_id', 'created_at'],
    include: [
      {
        model: Store,
        attributes: ['id', 'name', 'type', 'logo'],
        where: { type: 'web' },
      },
    ],
    limit: Number(req.query.limit) || 20,
    offset: Number(req.query.offset) || 0,
  };

  const fbs = {
    where: { store_category_id: 1 },
    attributes: ['id', 'url', 'rank', 'featured', 'info', 'store_id', 'store_category_id', 'created_at'],
    include: [
      {
        model: Store,
        attributes: ['name', 'type', 'logo'],
        where: { type: 'fb' },
      },
    ],
    limit: Number(req.query.limit) || 20,
    offset: Number(req.query.offset) || 0,
  };

  const feats = {
    where: { featured: 1, store_category_id: 1 },
    attributes: ['id', 'url', 'rank', 'featured', 'info', 'store_id', 'store_category_id', 'created_at'],
    include: [
      {
        model: Store,
        attributes: ['name', 'type', 'logo'],
      },
    ],
    limit: Number(req.query.limit) || 20,
    offset: Number(req.query.offset) || 0,
  };

  const option = {
    where: {},
    attributes: ['id', 'category', 'slug', 'created_at'],
  };

  const categories = await StoreCategory
    .findAll(option);
  log(categories);

  const storesweb = await StoreCategoryClub
    .findAll(web);

  const storesfbs = await StoreCategoryClub
    .findAll(fbs);
  const storesfeats = await StoreCategoryClub
    .findAll(feats);

  return res.json({
    storesweb,
    storesfbs,
    storesfeats,
    categories,
  });
};

exports.show = async (req, res) => {
  const { slug } = req.params;
  const storesweb = {
    where: { store_category_id: slug },
    attributes: ['id', 'url', 'rank', 'featured', 'info', 'store_id', 'store_category_id', 'created_at'],
    include: [
      {
        model: Store,
        attributes: ['id', 'name', 'type', 'logo'],
        where: { type: 'web' },
      },
    ],
    limit: Number(req.query.limit) || 20,
    offset: Number(req.query.offset) || 0,
  };
  const storesfbs = {
    where: { store_category_id: slug },
    attributes: ['id', 'url', 'rank', 'featured', 'info', 'store_id', 'store_category_id', 'created_at'],
    include: [
      {
        model: Store,
        attributes: ['name', 'type', 'logo'],
        where: { type: 'fb' },
      },
    ],
    limit: Number(req.query.limit) || 20,
    offset: Number(req.query.offset) || 0,
  };

  const storesfeats = {
    where: { featured: 1, store_category_id: slug },
    attributes: ['id', 'url', 'rank', 'featured', 'info', 'store_id', 'store_category_id', 'created_at'],
    include: [
      {
        model: Store,
        attributes: ['name', 'type', 'logo'],
      },
    ],
    limit: Number(req.query.limit) || 20,
    offset: Number(req.query.offset) || 0,
  };

  const web = await StoreCategoryClub
    .findAll(storesweb);

  const fb = await StoreCategoryClub
    .findAll(storesfbs);
  const feat = await StoreCategoryClub
    .findAll(storesfeats);

  return res.json({
    web,
    fb,
    feat,
  });
};
