const _ = require('lodash');
const debug = require('debug');

const { GROUPS: { OPS, CUSTOMER } } = require('../../config/constants');
const env = require('../../config/environment');
const hookshot = require('./user.hookshot');
const { generateVirtualAddressCode } = require('../../components/util');
const { encrypt } = require('../../components/crypto');

const {
  User, State, ActionableState, GroupState, Shipment, Country, Package,
  Locker,
} = require('../../conn/sqldb');

const log = debug('s.user.controller');
const {
  STATE_TYPES,
} = require('../../config/constants');

exports.index = (req, res, next) => {
  const options = {
    attributes: [
      'id', 'name', 'email', 'mobile', 'salutation', 'first_name', 'last_name', 'phone',
      'phone_code', 'country_id', 'referred_by', 'created_at', 'virtual_address_code',
      'profile_photo_url', 'updated_at', 'email_verify',
    ],
    include: [{
      model: Country,
      attributes: ['id', 'name', 'iso2'],
    }, {
      model: User,
      as: 'ReferredUser',
      attributes: ['id', 'name', 'salutation', 'first_name', 'last_name'],
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
        'phone_code', 'phone', 'secondary_phone_code', 'secondary_phone', 'profile_photo_url',
        'virtual_address_code', 'wallet_balance_amount', 'email_verify',
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

exports.create = async (req, res) => {
  const saved = await User.create({
    ...req.body,
    virtual_address_code: generateVirtualAddressCode(),
  });

  return res.json(saved);
};

exports.show = (req, res, next) => {
  const { id } = req.params;
  log('show', id);
  return User
    .findById(Number(id), {
      attributes: req.query.fl
        ? req.query.fl.split(',')
        : [
          'id', 'name', 'first_name', 'last_name', 'salutation', 'virtual_address_code',
          'mobile', 'email', 'phone', 'phone_code', 'email_verify', 'wallet_balance_amount',
        ],
      include: [{
        model: Country,
        attributes: ['id', 'name', 'iso2'],
      }, {
        model: Locker,
        attributes: ['id', 'name', 'short_name', 'allocated_at'],
      }],
    })
    .then(users => res.json(users))
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

const checkDuplicate = email => User.find({
  attributes: ['id'],
  where: { email },
  raw: true,
});

exports.register = async (req, res) => {
  const {
    salutation,
    first_name,
    last_name,
    email: e,
    mobile,
    password,
    virtual_addess_code: virtualAddressCode,
    hooks,
  } = req.body;

  const email = e.trim();
  // - Todo: Email Validation

  const exists = await checkDuplicate(email);
  if (exists) return res.status(409).json({ id: exists.id, message: 'Duplicate' });

  const IS_OPS = env.GSUITE_DOMAIN === email.trim().split('@')[1];

  // - Saving Customer Details
  const customer = await User.create({
    salutation,
    first_name,
    last_name,
    password,
    email,
    mobile,
    virtual_address_code: virtualAddressCode || generateVirtualAddressCode(),
    group_id: IS_OPS ? OPS : CUSTOMER,
    email_token: await encrypt(email),
  }, { hooks });

  // - Sending Verification Email via Hook
  await hookshot.signup(customer);

  return res
    .status(201)
    .json({
      message: `You need to confirm your account.
      We have sent you an activation code, please check your email.`,
    });
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
