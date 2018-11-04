const {
  PaymentGateway,
} = require('../../conn/sqldb');

exports.index = (req, res, next) => {
  const options = {
    attributes: ['id', 'name', 'fee'],
  };

  return PaymentGateway
    .findAll(options)
    .then(paymentGateway => res.json({ gateWay: paymentGateway }))
    .catch(next);
};

exports.show = (req, res, next) => {
  const { slug } = req.params;
  const options = {
    attributes: ['id', 'name'],
    where: { name: slug },
  };
  return PaymentGateway
    .find(options)
    .then(paymentGateway => res.json(paymentGateway))
    .catch(next);
};

