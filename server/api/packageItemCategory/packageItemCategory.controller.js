
const {
  PackageItemCategory,
} = require('../../conn/sqldb');

exports.index = (req, res, next) => {
  const options = {
    attributes: ['id', 'name'],
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

  const packageItemCategory = await PackageItemCategory.find({
    attributes: ['id'],
    where: { name: ItemCategory.name },
  });
  if (packageItemCategory) {
    res.status(200).json({ message: `Category  ${ItemCategory.name} is Already exists` });
  } else {
    PackageItemCategory
      .create(ItemCategory)
      .then(itemCategory =>
        res.json({ package_item_category_id: itemCategory.id, message: `Category  ${ItemCategory.name} is created` }))
      .catch(next);
  }
};

exports.destroy = async (req, res) => {
  const { id } = req.params;
  const status = await PackageItemCategory.destroy({ where: { id } });
  return res.status(200).json(status);
};
