const { Coupon } = require('./../../conn/sqldb');

exports.index = (req, res, next) => {
  const options = {
    attributes: [
      'id', 'name', 'code', 'cashback_percentage', 'discount_percentage', 'max_cashback_amount', 'expires_at', 'slug',
    ],
    limit: Number(req.query.limit) || 20,
    offset: Number(req.query.offset) || 0,
  };

  return Coupon
    .findAll(options)
    .then(coupons => res.json(coupons))
    .catch(next);
};

exports.create = async (req, res, next) => {
  Coupon
    .create(req.body)
    .then(coupons => res.status(201).json(coupons))
    .catch(next);
};

exports.update = async (req, res, next) => {
  Coupon
    .update(req.body, { where: { code: req.body.code } })
    .then(coupon => res.status(201).json(coupon))
    .catch(next);
};
