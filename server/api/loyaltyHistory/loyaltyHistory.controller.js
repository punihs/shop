const sequelize = require('sequelize');
const { LoyaltyHistory, LoyaltyPoint } = require('../../conn/sqldb/index');
const { LOYALTY_TYPE: { REWARD } } = require('../../config/constants');

exports.create = async (req, res, next) => {
  const loyaltyHistory = req.body;
  const customerId = req.body.customer_id;
  const option = {
    where: { customer_id: customerId },
  };
  const loyaltyPoint = {};
  const optionLoyalty = {
    attributes: ['id', 'total_points'],
    where: { customer_id: customerId },
  };
  loyaltyHistory.type = REWARD;

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
    .find(optionLoyalty)
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
