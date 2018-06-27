const { ShippingPreference } = require('./../../conn/sqldb');

exports.show = (req, res) => {
  const { id } = req.params;
  const options = {
    attributes: ['id', 'basic_photo', 'advanced_photo', 'scan_document', 'repacking'],
  };
  const preference = ShippingPreference
    .findById(id, options);
  return res.json(preference);
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const preference = req.body;
  const status = await ShippingPreference
    .update(preference, { where: { customer_id: id } });
  return res.json(status);
};

