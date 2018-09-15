const { ShippingPreference } = require('./../../conn/sqldb');

exports.show = async (req, res) => {
  const options = {
    attributes: ['id', 'is_basic_photo', 'is_advanced_photo', 'is_scan_document', 'is_repacking',
      'is_sticker', 'is_extra_packing', 'is_original_box', 'is_mark_personal_use',
      'is_gift_wrap', 'is_gift_note', 'max_weight', 'is_include_invoice', 'tax_id'],
    where: { customer_id: req.user.id },
  };
  const preference = await ShippingPreference
    .findAll(options);

  res.json({ preference });
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const preference = req.body;

  const status = await ShippingPreference
    .update(preference, { where: { customer_id: id } });
  return res.json(status);
};

