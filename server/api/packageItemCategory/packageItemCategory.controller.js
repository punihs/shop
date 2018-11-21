const {
  PackageItemCategory,
} = require('../../conn/sqldb');

exports.index = async (req, res, next) => {
  try {
    const packageItemcategory = await PackageItemCategory
      .findAll({
        attributes: ['id', 'name'],
        offset: Number(req.query.offset) || 0,
        limit: Number(req.query.limit) || 20,
      });

    return res.json(packageItemcategory);
  } catch (err) {
    return next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name } = req.body;

    const packageItemCategory = await PackageItemCategory
      .findOne({
        attributes: ['id'],
        where: { name },
      });

    if (packageItemCategory) {
      return res
        .status(200)
        .json({
          id: packageItemCategory.id,
          message: `Category  ${name} is Already exists`,
        });
    }

    const { id } = await PackageItemCategory
      .create({
        name,
        created_by: req.user.id,
      });

    return res.json({
      id,
      message: `Category  ${name} is created`,
    });
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
