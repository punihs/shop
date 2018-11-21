const {
  PACKAGE_STATE_IDS: {
    DAMAGED,
  },
} = require('../../config/constants');

const { PackageState } = require('../../conn/sqldb');

exports.index = async (req, res, next) => {
  const { packageIds } = req.query;

  PackageState
    .findAll({
      attributes: ['id', 'package_id'],
      where: {
        package_id: packageIds.split(','),
        state_id: DAMAGED,
      },
    })
    .then(packageStates =>
      res.json({ packageStates }))
    .catch(next);
};
