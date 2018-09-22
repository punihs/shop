const sequelize = require('sequelize');
const { LoyaltyHistory, LoyaltyPoint } = require('../../conn/sqldb/index');
const { LOYALTY_TYPE: { REWARD } } = require('../../config/constants');


exports.index = async (req, res) => {
  const options = {
    attributes: ['id', 'customer_id', 'points', 'description', 'created_at'],
    limit: Number(req.query.limit) || 20,
  };
  if (req.query.customer_id) options.where = { customer_id: req.query.customer_id };

  const loyaltyPoints = await LoyaltyPoint
    .find({
      attributes: ['id', 'total_points', 'level', 'created_at', 'points'],
      limit: Number(req.query.limit) || 20,
    });
  const loyaltyHistory = await LoyaltyHistory
    .findAll(options);
  res.status(200).json({ loyaltyHistory, loyaltyPoints });
};

exports.create = async (req, res, next) => {
  const loyaltyHistory = req.body;
  const customerId = req.body.customer_id;
  const option = {
    where: { customer_id: customerId },
  };
  const loyaltyPoint = {};
  loyaltyHistory.type = REWARD;
  loyaltyHistory.customer_id = customerId;


  await LoyaltyHistory
    .create(loyaltyHistory);

  await LoyaltyPoint
    .update({
      points: sequelize
        .literal(`points + ${loyaltyHistory.points}`),
      total_points: sequelize
        .literal(`total_points + ${loyaltyHistory.points}`),
    }, option);

  await LoyaltyPoint
    .find({
      attributes: ['id', 'total_points'],
      where: { customer_id: customerId },
    })
    .then((loyalty) => {
      if (loyalty.total_points < 1000) {
        loyaltyPoint.level = 1;
      } else if (loyalty.total_points >= 1000 && loyalty.total_points < 6000) {
        loyaltyPoint.level = 2;
      } else if (loyalty.total_points >= 6000 && loyalty.total_points < 26000) {
        loyaltyPoint.level = 3;
      } else if (loyalty.total_points >= 26000) {
        loyaltyPoint.level = 4;
      }
      loyalty.update(loyaltyPoint);
    })
    .catch(next);

  return res.json(loyaltyHistory);
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const loyaltyHistory = req.body;
  const customerId = req.body.customer_id;
  const history = await LoyaltyHistory
    .find({ attributes: ['points'] }, { where: { id } });
  const status = await LoyaltyHistory.update(loyaltyHistory, { where: { id } });
  const option = {
    where: { customer_id: customerId },
  };
  const loyaltyPoint = {};
  await LoyaltyPoint
    .update({
      points: sequelize
        .literal(`points - ${history.points}`),
      total_points: sequelize
        .literal(`total_points - ${history.points}`),
    }, option);
  await LoyaltyPoint
    .find({
      attributes: ['id', 'total_points'],
      where: { customer_id: customerId },
    })
    .then((loyalty) => {
      loyaltyPoint.points = sequelize
        .literal(`points + ${loyaltyHistory.points}`);
      loyaltyPoint.total_points = sequelize
        .literal(`total_points + ${loyaltyHistory.points}`);
      if (loyalty.total_points < 1000) {
        loyaltyPoint.level = 1;
      } else if (loyalty.total_points >= 1000 && loyalty.total_points < 6000) {
        loyaltyPoint.level = 2;
      } else if (loyalty.total_points >= 6000 && loyalty.total_points < 26000) {
        loyaltyPoint.level = 3;
      } else if (loyalty.total_points >= 26000) {
        loyaltyPoint.level = 4;
      }
      loyalty.update(loyaltyPoint);
    });
  return res.json(status);
};

exports.destroy = async (req, res) => {
  const { id } = req.params;
  const customerId = req.query.customer_id;
  const { points } = req.query;
  const loyaltyPoint = {};
  const option = {
    where: { customer_id: customerId },
  };
  const status = await LoyaltyHistory.destroy({
    paranoid: true,
    where: { id },
  });
  await LoyaltyPoint
    .update({
      points: sequelize
        .literal(`points - ${points}`),
      total_points: sequelize
        .literal(`total_points - ${points}`),
    }, option);
  await LoyaltyPoint
    .find({
      attributes: ['id', 'total_points'],
      where: { customer_id: customerId },
    })
    .then((loyalty) => {
      if (loyalty.total_points < 1000) {
        loyaltyPoint.level = 1;
      } else if (loyalty.total_points >= 1000 && loyalty.total_points < 6000) {
        loyaltyPoint.level = 2;
      } else if (loyalty.total_points >= 6000 && loyalty.total_points < 26000) {
        loyaltyPoint.level = 3;
      } else if (loyalty.total_points >= 26000) {
        loyaltyPoint.level = 4;
      }
      loyalty.update(loyaltyPoint);
    });
  return res.json(status);
};
