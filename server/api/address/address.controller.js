const _ = require('lodash');

const { GROUPS: { CUSTOMER } } = require('./../../config/constants');
const { ajv, transform } = require('./../../components/ajv');
const { Address, Country } = require('./../../conn/sqldb');
const { ADDRESS_COUNT } = require('./../../config/constants/options');

exports.index = async (req, res, next) => {
  try {
    const options = {
      attributes: req.query.fl
        ? req.query.fl.split(',')
        : [
          'id', 'customer_id', 'country_id', 'first_name', 'last_name', 'salutation',
          'line1', 'line2', 'state', 'city', 'pincode', 'phone', 'is_default',
        ],
      where: {},
      include: [{
        model: Country,
        attributes: ['iso2', 'name'],
      }],
      order: [['is_default', 'DESC'], ['created_at', 'DESC']],
      limit: Number(req.query.limit) || 20,
    };

    if (req.user.group_id === CUSTOMER) {
      options.where.customer_id = req.user.id;
    } else if (req.query.id) {
      options.where.customer_id = req.query.id;
    }

    const addresses = await Address
      .findAll(options);

    const count = await Address
      .count({ where: { customer_id: options.where.customer_id } });

    const defaultAddress = await Address
      .find({
        where: { is_default: true, customer_id: options.where.customer_id },
        include: [{
          model: Country,
          attributes: ['id', 'name'],
        }],
      });

    return res.json({ addresses, count, addressLimit: ADDRESS_COUNT, defaultAddress });
  } catch (err) {
    return next(err);
  }
};

exports.show = async (req, res, next) => {
  try {
    const options = {
      attributes: req.query.fl
        ? req.query.fl.split(',')
        : [
          'id', 'customer_id', 'country_id', 'first_name', 'last_name', 'salutation',
          'line1', 'line2', 'state', 'city', 'pincode', 'phone', 'is_default',
        ],
      where: {},
      include: [{
        model: Country,
        attributes: ['name'],
      }],
    };

    if (req.user.group_id === CUSTOMER) {
      options.where.customer_id = req.user.id;
      options.where.id = req.params.id;
    }

    const address = await Address
      .find(options);

    return res.json(address);
  } catch (err) {
    return next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const valid = ajv.validate('createAddress', req.body);

    if (!valid) {
      return res
        .status(400)
        .json(transform(ajv));
    }

    const { is_default: isDefault } = req.body;

    const count = await Address
      .count({ where: { customer_id: req.user.id } });

    if (count >= ADDRESS_COUNT) {
      return res.status(406).json({ message: `Address limit exceeded only ${ADDRESS_COUNT} address can be stored ` });
    }

    if (isDefault) {
      const where = {
        is_default: true,
        customer_id: req.user.id,
      };

      await Address
        .count({ where })
        .then((found) => {
          if (!found) return Promise.resolve();
          return Address.update({ is_default: false }, { where });
        });
    }

    const { id } = await Address
      .create(Object.assign({}, req.body, {
        customer_id: req.user.id,
      }));

    return res.status(201).json({ id });
  } catch (err) {
    return next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.body.is_default) {
      await Address
        .update({
          is_default: false,
        }, {
          where: {
            customer_id: req.user.id,
          },
        });
    }

    const status = await Address
      .update(_.omit(req.body, ['customer_id']), { where: { id } });

    return res
      .json(status);
  } catch (err) {
    return next(err);
  }
};

exports.destroy = async (req, res, next) => {
  try {
    const { id } = req.params;

    const address = await Address
      .destroy({
        where: {
          id,
          customer_id: req.user.id,
        },
      });

    return res.json(address);
  } catch (err) {
    return next(err);
  }
};

