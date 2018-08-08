const debug = require('debug');

const {
  Redemption, Coupon,
} = require('../../conn/sqldb');

const log = debug('s.redemtion.controller');

exports.update = async (req, res) => {
  const options = {
    attribute: ['id'],
    where: { shipment_order_code: req.query.order_code },
  };
  const promoAppliedStatus = await Redemption
    .find(options);
  const optionCoupon = {
    attributes: ['id'],
    where: {
      code: req.query.coupon_code,
      expires_at: {
        $gt: new Date(),
      },
    },
  };

  const promoValue = await Coupon
    .find(optionCoupon);
  log(promoValue);
  if (promoValue) {
    if (!promoAppliedStatus) {
      const promoApplied = {};
      promoApplied.shipment_order_code = req.query.order_code;
      promoApplied.coupon_code = req.query.coupon_code;
      promoApplied.customer_id = req.user.id;
      await Redemption.create(promoApplied);

      return res.json({ message: 'promocode applied' });
    } else if ((promoAppliedStatus) && promoAppliedStatus.coupon_code !== req.query.coupon_code) {
      const redemption = {};
      redemption.coupon_code = req.query.coupon_code;
      await Redemption
        .update(
          redemption,
          { where: { shipment_id: req.query.order_code } },
        );
    } else if ((promoAppliedStatus) && promoAppliedStatus.coupon_code === req.query.coupon_code) {
      log('Promo code Already applied.');
      return res.status(200).json({ message: 'Promo code Already applied.' });
    }
  }
  log('Invalid or Expired Promo Code .');
  return res.json({ message: 'Invalid or Expired Promo Code .' }).status(200);
};
