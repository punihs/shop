const {
  ShippingPreference, Address, User, Country,
} = require('./../../../conn/sqldb');

exports.show = async (req, res, next) => {
  try {
    const { id: customerId } = req.params;

    const shippingPreference = await ShippingPreference
      .find({
        attributes: ['id', 'is_basic_photo', 'is_advanced_photo', 'is_scan_document', 'is_repacking',
          'is_sticker', 'is_extra_packing', 'is_original_box', 'is_mark_personal_use',
          'is_gift_wrap', 'is_gift_note', 'max_weight', 'is_include_invoice', 'tax_id'],
        where: { customer_id: customerId },
        include: [{
          model: User,
          attributes: ['id'],
        }],
      });

    const userAddress = await User
      .find({
        attributes: ['id'],
        where: { id: customerId },
        include: [{
          model: Address,
          attributes: ['id', 'customer_id', 'country_id', 'first_name', 'last_name', 'salutation',
            'line1', 'line2', 'state', 'city', 'pincode', 'phone', 'is_default'],
          where: { is_default: true },
          include: [{
            model: Country,
            attributes: ['id', 'name'],
          }],
        }],
      });

    return res.status(201).json({ shippingPreference, userAddress });
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
