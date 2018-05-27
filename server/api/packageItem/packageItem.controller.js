const moment = require('moment');
const {
  PackageItem,
} = require('../../conn/sqldb');
const minio = require('../../conn/minio');
const { PRICE_ENTERER: { SHOPPRE } } = require('../../config/constants');

exports.index = (req, res, next) => {
  const options = {
    attributes: ['id', 'name'],
    limit: Number(req.query.limit) || 20,
  };
  return PackageItem
    .findAll(options)
    .then(packages => res.json(packages))
    .catch(next);
};


exports.create = async (req, res, next) => {
  const packageItem = req.body;
  const { base64: base64String, filename } = req.body.photo_file;
  const extension = filename.split('.').pop();
  if (!['jpg', 'jpeg', 'png', 'bmp'].includes(extension.toLowerCase())) {
    return res.status(400).end('Invalid File');
  }

  packageItem.created_by = req.user.id;
  packageItem.total_amount = packageItem.price_amount * packageItem.quantity;

  if (packageItem.price) {
    packageItem.price_entered_by = SHOPPRE;
  }

  return PackageItem
    .create(packageItem)
    .then((saved) => {
      const { id } = saved;
      const object = `package_items/${id}/${id}_${moment().format('YYYY_MM_DD_h_mm_ss')}.${extension}`;
      minio
        .base64Upload({
          object,
          base64String,
        })
        .then(() => saved.update({ object }));
      return res.status(201).json({ id });
    })
    .catch(next);
};

exports.show = (req, res, next) => {
  PackageItem
    .find({
      attributes: ['id', 'quantity', 'price_amount', 'total_amount'],
      where: { id: req.param.id },
    })
    .then(packageitems => res.json(packageitems))
    .catch(next);
};

exports.destroy = async (req, res) => {
  const { id } = req.params;
  const status = await PackageItem.destroy({ where: { id } });
  return res.json(status);
};

exports.destroy = async (req, res) => {
  const { id } = req.params;
  const status = await PackageItem.destroy({ where: { id } });
  return res.json(status);
};

exports.metaUpdate = async (req, res) => {
  const { id } = req.params;
  const packageItem = req.body;
  packageItem.total = packageItem.price_amount * packageItem.quantity;
  const status = await PackageItem.update(packageItem, { where: { package_id: id } });
  return res.json(status);
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const status = await PackageItem.update({ object: null }, { where: { id } });
  return res.json(status);
};

