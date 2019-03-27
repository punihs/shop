const debug = require('debug');
const _ = require('lodash');

const logger = require('../../components/logger');
const { NotificationSubscription } = require('../../conn/sqldb');

const log = debug('notificationSubscription.controller');

exports.create = (req, res, next) => {
  if (!req.body.player_id) {
    return res
      .status(400)
      .json({
        message: 'bad request',
        description: 'check body',
      });
  }
  const { user_id: userId } = req.body;

  return NotificationSubscription
    .find({
      where: {
        player_id: req.body.player_id,
      },
    })
    .then((notificationSubscription) => {
      if (notificationSubscription) {
        if (notificationSubscription.user_id === req.body.user_id) {
          return res
            .status(409)
            .json({
              message: 'Duplicate Subscription. Nothing done',
            });
        }

        notificationSubscription
          .update({ user_id: userId })
          .catch(err => logger.error('notificationSubscription', req.body, err));

        return res.json({
          message: 'Subscription already exist. Updated userid',
        });
      }

      return NotificationSubscription
        .create({
          player_id: req.body.player_id,
          user_id: req.body.user_id,
        })
        .then(saved => res
          .json(_.pick(saved, 'user_id', 'player_id')));
    })
    .catch(next);
};

exports.destroy = (req, res, next) => {
  log('destroy');
  return NotificationSubscription
    .destroy({
      where: {
        player_id: req.params.playerId,
        user_id: req.query.user_id,
      },
    })
    .then(() => res.status(200).end())
    .catch(next);
};
