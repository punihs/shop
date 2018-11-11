const _ = require('lodash');
const debug = require('debug');

const {
  User, State, ActionableState, GroupState, Shipment, Country, Package, PackageState,
  Locker,
} = require('../../conn/sqldb');
const service = require('./user.service');

const log = debug('s.user.controller');

const {
  STATE_TYPES,
  PACKAGE_STATE_IDS: { INCOMING_PACKAGE },
  PACKAGE_TYPES: { INCOMING },
} = require('../../config/constants');

exports.index = (req, res, next) => {
  const options = {
    attributes: [
      'id', 'name', 'email', 'salutation', 'first_name', 'last_name', 'phone',
      'country_id', 'created_at', 'virtual_address_code',
      'profile_photo_url', 'updated_at', 'email_verify',
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

  const { q, email, virtual_address_code: lockerCode } = req.query;
  if (lockerCode) options.where.virtual_address_code = lockerCode.trim();
  if (email) options.where.email = email.trim();
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

  return User
    .findAll(options)
    .then(users => res.json(users))
    .catch(next);
};

exports.me = (req, res, next) => {
  log('me');
  return User
    .findById(req.user.id, {
      attributes: [
        'id', 'salutation', 'first_name', 'last_name', 'email', 'alternate_email', 'group_id',
        'phone', 'secondary_phone', 'profile_photo_url',
        'virtual_address_code',
      ],
      limit: Number(req.query.limit) || 20,
    })
    .then(user => res.json(user))
    .catch(next);
};

exports.states = (req, res, next) => {
  const groupId = Number(req.user.group_id);

  return State
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
        { // for Hire: 2, Partner: 5, Others: 5(internal)
          model: GroupState,
          // where: { group_id: [2, 5, 15].includes(groupId) ? groupId : 4 },
          attributes: ['name', 'description'],
          required: false,
        },
      ],
      order: [
        ['id', 'ASC'],
        [{ model: ActionableState, as: 'Actions' }, 'id', 'ASC'],
      ],
    })
    .then((stateList) => {
      const out = [];
      stateList.forEach((stateModel) => {
        const state = stateModel.toJSON();
        if (state.Childs.length === 0) state.Childs.push({ state_id: state.id });
        state.config = JSON.parse(state.config); // Need to handle Parsing Error
        const { name = state.name, description } = state.GroupState || {};
        state.action = name;
        state.description = description;
        out[state.id] = _.pick(state, ['id', 'name', 'action', 'config', 'Childs', 'Actions', 'description']);
      });

      res.json(out);
    })
    .catch(next);
};

exports.show = (req, res, next) => {
  const { id } = req.params;
  log('show', id);

  return Promise
    .all([
      User
        .findById(Number(id), {
          attributes: req.query.fl
            ? req.query.fl.split(',')
            : [
              'id', 'name', 'first_name', 'last_name', 'salutation', 'virtual_address_code',
              'phone', 'email', 'email_verify',
              'secondary_phone', 'alternate_email',
            ],
          include: [{
            model: Country,
            attributes: ['id', 'name', 'iso2'],
          }, {
            model: Locker,
            attributes: ['id', 'name', 'short_name', 'allocated_at'],
          }],
        }),
      Package
        .count({
          include: [{
            model: PackageState,
            where: { state_id: INCOMING_PACKAGE },
          }],
          where: {
            customer_id: req.params.id,
            package_type: INCOMING,
          },
        }),
    ])
    .then(([user, packageCount]) => {
      res.json({ ...user.toJSON(), packageCount });
    })
    .catch(next);
};

exports.unread = async (req, res) => {
  const { id } = req.params;
  const status = await User.update({ admin_read: 'no' }, { where: { id } });
  return res.json(status);
};

exports.update = (req, res, next) => {
  const id = req.params.id || req.user.id;
  return User
    .update(req.body, { where: { id } })
    .then(({ id: Id }) => res.json({ id: Id }))
    .catch(next);
};

exports.destroy = async (req, res) => {
  const { id } = req.params;
  const status = await User.destroy({
    paranoid: true,
    where: { id },
  });
  return res.json(status);
};
const messagesMap = {
  201: `You need to confirm your account.
        We have sent you an activation code, please check your email.`,
  409: 'Duplicate',
};

exports.register = async (req, res, next) => {
  log('register');
  return service
    .signup({ body: req.body })
    .then(status => res
      .status(status.code)
      .json({
        message: messagesMap[status.code],
      }))
    .catch(next);
};

exports.verify = async (req, res) => {
  const { email } = req.body;
  if (email) {
    const options = {
      attributes: [
        'email_verify', 'id',
      ],
      where: { email, id: req.user.id },
    };
    await User.find(options)
      .then((customer) => {
        if (customer.email_verify !== 'yes') {
          if (req.body.token === customer.email_token) {
            customer.update({
              email_token: null,
              email_verify: 'yes',
            });
            res.json({ message: 'Email address verified successfully. Please login to continue.' });
          } else {
            res.json({ error: 'Email verification failed! Resend verfication link from your profile.' });
          }
        } else {
          res.json({ message: 'Your email address already been verified. Please login to continue.' });
        }
      });
  }
};

exports.updateChangePassword = async (req, res, next) => { // change Password
  if (req.body.password !== req.body.confirm_password) {
    return res.json({ message: 'Password and confirm did not match' });
  }
  log('id', req.params.id);
  log('body', JSON.stringify(req.body));
  await User
    .findById(req.params.id, { attributes: ['id'] })
    .then((customer) => {
      customer.update({ password: req.body.password })
        .catch(next);
    });

  return res.json({ message: 'Your account password has been changed. Please login to continue.' });
};
