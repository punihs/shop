const _ = require('lodash');
const debug = require('debug');
const jsonwebtoken = require('jsonwebtoken');

const authorise = require('../../components/oauth/authorise');
const { MASTER_TOKEN } = require('../../config/environment');

const {
  User, State, ActionableState, GroupState, Shipment, Country, Package, PackageState,
  Locker, PHPCustomer,
} = require('../../conn/sqldb');
const service = require('./user.service');

const log = debug('s.user.controller');

const {
  STATE_TYPES,
  PACKAGE_STATE_IDS: {
    INCOMING_PACKAGE, PAYMENT_COMPLETED,
    ORDER_PLACED, PAYMENT_CONFIRMED, IN_TRANSIT, AWAITING_FOR_ORDER,
  },
  PACKAGE_TYPES: { INCOMING, PERSONAL_SHOPPER, COD },
} = require('../../config/constants');

exports.index = async (req, res, next) => {
  try {
    const options = {
      attributes: [
        'id', 'name', 'email', 'salutation', 'first_name', 'last_name', 'phone',
        'country_id', 'created_at', 'virtual_address_code',
        'profile_photo_url', 'updated_at',
      ],
      include: [{
        model: Country,
        attributes: ['id', 'name', 'iso2'],
      }, {
        model: Shipment,
        attributes: ['id'],
      }, {
        model: Package,
        attributes: ['id'],
      }, {
        model: Locker,
        attributes: ['id', 'name', 'short_name'],
      }],
      where: {},
      limit: Number(req.query.limit) || 10,
      offset: Number(req.query.offset) || 0,
      order: [['created_at', 'desc']],
    };

    if (req.query.sort) {
      const [field, order] = req.query.sort.split(' ');
      log({ field, order });
      if (field && order) {
        options.order = [[field, order]];
      }
    }

    if (req.query.group_id) options.where.group_id = req.query.group_id;

    const { q, email, virtual_address_code: virtualAddressCode } = req.query;

    if (virtualAddressCode) options.where.virtual_address_code = virtualAddressCode.trim();

    if (email) options.where.email = email.trim();

    // if (req.query.q.includes(' ')) {
    //   const [firstName, lastName] = req.query.q.split(' ');
    //   options.where.$and = {
    //     first_name: {
    //       $like: `%${firstName}%`,
    //     },
    //     last_name: {
    //       $like: `%${lastName}%`,
    //     },
    //   };
    // } else
    if (req.query.q) {
      options.where.$or = {
        first_name: {
          $like: `%${q}%`,
        },
        last_name: {
          $like: `%${q}%`,
        },
      };
    }

    const users = await User
      .findAll(options);

    return res.json(users);
  } catch (err) {
    return next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    log('me');

    const user = await User
      .findById(req.user.id, {
        attributes: [
          'id', 'salutation', 'first_name', 'last_name', 'email', 'alternate_email', 'group_id',
          'phone', 'secondary_phone', 'profile_photo_url',
          'virtual_address_code', 'is_courier_migrated',
        ],
        limit: Number(req.query.limit) || 20,
      });

    return res.json(user);
  } catch (err) {
    return next(err);
  }
};

exports.states = async (req, res, next) => {
  try {
    const groupId = Number(req.user.group_id);

    const states = await State
      .findAll({
        attributes: ['id', 'name', 'parent_id', 'config'],
        where: { type: STATE_TYPES[req.query.type] },
        include: [
          {
            model: State,
            as: 'Childs',
            attributes: [['id', 'state_id']],
            where: {
              type: STATE_TYPES[req.query.type],
            },
            required: false,
          },
          {
            model: ActionableState,
            as: 'Actions',
            where: {
              group_id: groupId,
              type: STATE_TYPES[req.query.type],
            },
            attributes: [['child_id', 'state_id']],
            required: false,
          },
          {
            model: GroupState,
            attributes: ['name', 'description'],
            required: false,
          },
        ],
        order: [
          ['id', 'ASC'],
          [{ model: ActionableState, as: 'Actions' }, 'id', 'ASC'],
        ],
      });

    return res.json(states.reduce((n, stateModel) => {
      const nxt = n;
      const state = stateModel.toJSON();

      if (state.Childs.length === 0) state.Childs.push({ state_id: state.id });

      state.config = JSON.parse(state.config);

      const { name = state.name, description } = state.GroupState || {};

      state.action = name;
      state.description = description;

      nxt[state.id] = _
        .pick(state, ['id', 'name', 'action', 'config', 'Childs', 'Actions', 'description']);

      return nxt;
    }, []));
  } catch (err) {
    return next(err);
  }
};

exports.show = async (req, res, next) => {
  try {
    const { id } = req.params;
    log('show', id);

    const user = await User
      .findById(Number(id), {
        attributes: req.query.fl
          ? req.query.fl.split(',')
          : [
            'id', 'name', 'first_name', 'last_name', 'salutation', 'virtual_address_code',
            'phone', 'email', 'is_courier_migrated',
            'secondary_phone', 'alternate_email',
          ],
        include: [{
          model: Country,
          attributes: ['id', 'name', 'iso2'],
        }, {
          model: Locker,
          attributes: ['id', 'name', 'short_name', 'allocated_at'],
        }],
      });

    const packageCount = await Package
      .count({
        include: [{
          model: PackageState,
          where: { state_id: INCOMING_PACKAGE },
        }],
        where: {
          customer_id: req.params.id,
          package_type: INCOMING,
        },
      });

    const personalShopperCount = await Package
      .count({
        include: [{
          model: PackageState,
          where: {
            state_id: [PAYMENT_COMPLETED, ORDER_PLACED, PAYMENT_CONFIRMED,
              IN_TRANSIT, AWAITING_FOR_ORDER],
          },
        }],
        where: {
          customer_id: req.params.id,
          package_type: [PERSONAL_SHOPPER, COD],
        },
      });

    return res.json({ ...user.toJSON(), packageCount, personalShopperCount });
  } catch (err) {
    return next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const id = req.params.id || req.user.id;

    const status = await User
      .update(req.body, { where: { id } });

    return res.json({ id: status.id });
  } catch (err) {
    return next(err);
  }
};

exports.destroy = async (req, res, next) => {
  try {
    const { id } = req.params;

    const status = await User.destroy({
      paranoid: true,
      where: { id },
    });

    return res.json(status);
  } catch (err) {
    return next(err);
  }
};

const messagesMap = {
  201: `You need to confirm your account.
        We have sent you an activation code, please check your email.`,
  409: 'Duplicate',
};

exports.register = async (req, res, next) => {
  try {
    log('register');

    const status = await service
      .signup({ body: req.body });

    return res
      .status(status.code)
      .json({ message: messagesMap[status.code] });
  } catch (err) {
    return next(err);
  }
};

exports.updateChangePassword = async (req, res, next) => {
  try {
    if (req.body.password !== req.body.confirm_password) {
      return res.json({ message: 'Password and confirm did not match' });
    }
    log('body', JSON.stringify(req.body));

    await User
      .update({ password: req.body.password }, { where: { id: req.params.id } });

    return res.json({ message: 'Your account password has been changed. Please login to continue.' });
  } catch (err) {
    return next(err);
  }
};

exports.authorise = async (req, res, next) => {
  try {
    const { email } = jsonwebtoken.verify(req.query.otp, MASTER_TOKEN);
    const url = await authorise(email);
    if (req.query.continue) res.redirect(`${url}&continue=${req.query.continue}`);
    else res.redirect(url);

    return email;
  } catch (err) {
    return next(err);
  }
};
