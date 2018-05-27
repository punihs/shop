const {
  PackageMeta,
} = require('../../../conn/sqldb');

exports.show = (req, res, next) => {
  const { id } = req.params;
  const options = {
    where: { package_id: id },
    limit: Number(req.query.limit) || 20,
  };

  return PackageMeta
    .findAll(options)
    .then(packages => res.json(packages))
    .catch(next);
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const packageMeta = req.body;
  const status = await PackageMeta.update(packageMeta, { where: { package_id: id } });
  return res.json(status);
};
