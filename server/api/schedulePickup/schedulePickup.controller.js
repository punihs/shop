const debug = require('debug');

const log = debug('package');
const { SchedulePickup } = require('../../conn/sqldb');

exports.index = (req, res, next) => {
  log('schedulepickup');
  return SchedulePickup
    .findAll({
      attributes: [
        'id', 'user_first_name', 'user_email', 'package_items',
        'number_of_packages', 'package_weight', 'created_at',
        'status',
      ],
      limit: Number(req.query.limit) || 20,
      offset: Number(req.query.offset) || 0,
    })
    .then(schedulePickup => res.json(schedulePickup))
    .catch(next);
};

exports.create = async (req, res, next) => SchedulePickup
  .create(req.body)
  .then(({ id }) => res.status(201).json({ id }))
  .catch(next);
