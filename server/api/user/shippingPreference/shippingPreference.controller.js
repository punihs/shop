const { ShippingPreference, Address, User } = require('./../../../conn/sqldb');

exports.show = async (req, res, next) => {
  try {
    const { id: customerId } = req.params;

    const shippingPreference = await ShippingPreference
      .findOne({
        attributes: ['id', 'is_basic_photo', 'is_advanced_photo', 'is_scan_document', 'is_repacking',
          'is_sticker', 'is_extra_packing', 'is_original_box', 'is_mark_personal_use',
          'is_gift_wrap', 'is_gift_note', 'max_weight', 'is_include_invoice', 'tax_id'],
        where: { customer_id: customerId },
        include: [{
          model: User,
          attributes: ['id'],
          include: [{
            model: Address,
            attributes: ['id', 'customer_id', 'country_id', 'first_name', 'last_name', 'salutation',
              'line1', 'line2', 'state', 'city', 'pincode', 'phone', 'is_default'],
            where: { is_default: true },
          }],
        }],
      });

    return res.json({ shippingPreference });
  } catch (err) {
    return next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const preference = req.body;

    const status = await ShippingPreference
      .update(preference, { where: { customer_id: id } });

    return res.json(status);
  } catch (err) {
    return next(err);
  }
};
