const { ShippingPreference } = require('./../../conn/sqldb');

exports.show = (req, res) => {
  const { id } = req.params;
  const options = {
    attributes: ['id', 'is_basic_photo', 'is_advanced_photo', 'is_scan_document', 'is_repacking'],
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

