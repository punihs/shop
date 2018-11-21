const {
  PackageItemCategory,
} = require('../../conn/sqldb');

exports.index = async (req, res, next) => {
  try {
    const packageItemcategory = await PackageItemCategory
      .findAll({
        attributes: ['id', 'name'],
        limit: Number(req.query.limit) || 20,
      });

    return res.json(packageItemcategory);
  } catch (err) {
    return next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const ItemCategory = req.body;
    ItemCategory.created_by = ItemCategory.user_id;

    const packageItemCategory = await PackageItemCategory.find({
      attributes: ['id'],
      where: { name: ItemCategory.name },
    });
    if (packageItemCategory) {
      res.status(200).json({ message: `Category  ${ItemCategory.name} is Already exists` });
    } else {
      const itemCategory = await PackageItemCategory
        .create(ItemCategory);

      res.json({ package_item_category_id: itemCategory.id, message: `Category  ${ItemCategory.name} is created` });
    }
  } catch (err) {
    return next(err);
  }
};

exports.destroy = async (req, res, next) => {
  const { id } = req.params;
  try {
    const status = await PackageItemCategory.destroy({ where: { id } });

    return res.status(200).json(status);
  } catch (err) {
    return next(err);
  }
};
