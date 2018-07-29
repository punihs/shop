const { ShippingPreference } = require('./../../conn/sqldb');

exports.show = (req, res) => {
  const options = {
    attributes: ['id', 'is_basic_photo', 'is_advanced_photo', 'is_scan_document', 'is_repacking',
      'is_sticker', 'is_extra_packing', 'is_original_box',
      'is_gift_wrap', 'is_gift_note', 'max_weight'],
    where: { customer_id: req.user.id },
  };
  const preference = ShippingPreference
    .findAll(options);
  res.json(preference);
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const preference = req.body;
  const status = await ShippingPreference
    .update(preference, { where: { id } });
  return res.json(status);
};

