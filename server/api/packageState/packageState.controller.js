const {
  PACKAGE_STATE_IDS: {
    DAMAGED,
  },
} = require('../../config/constants');

const { PackageState } = require('../../conn/sqldb');

exports.index = async (req, res, next) => {
  try {
    const { packageIds } = req.query;

    const packageStates = await PackageState
      .findAll({
        attributes: ['id', 'package_id'],
        where: {
          package_id: packageIds.split(','),
          state_id: DAMAGED,
        },
      });

    return res.json({ packageStates });
  } catch (err) {
    return next(err);
  }
};
