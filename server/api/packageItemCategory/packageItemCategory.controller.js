
const {
  PackageItemCategory,
} = require('../../conn/sqldb');

exports.index = (req, res, next) => {
  const options = {
    attributes: ['id'],
    limit: Number(req.query.limit) || 20,
  };
  return PackageItemCategory
    .findAll(options)
    .then(packages => res.json(packages))
    .catch(next);
};

exports.create = async (req, res, next) => {
  const ItemCategory = req.body;
  ItemCategory.created_by = ItemCategory.user_id;
  return PackageItemCategory
    .create(ItemCategory)
    .then(({ id }) => res.status(201).json({ id }))
    .catch(next);
};

exports.destroy = async (req, res) => {
  const { id } = req.params;
  const status = await PackageItemCategory.destroy({ where: { id } });
  return res.status(200).json(status);
};
