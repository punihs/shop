const _ = require('lodash');
const debug = require('debug');
const uuidv4 = require('uuid/v4');

const Minio = require('../../conn/minio');
const {
  User, State, ActionableState, GroupState, Shipment, Country, Package, Order,
} = require('../../conn/sqldb');
const { MINIO_BUCKET } = require('../../config/environment');

const log = debug('s.user.controller');

exports.index = (req, res, next) => {
  const options = {
    attributes: [
      'id', 'name', 'email', 'mobile', 'salutation', 'first_name', 'last_name', 'phone',
      'phone_code', 'country_id', 'referred_by', 'created_at', 'locker_code',
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
      model: Order,
      attributes: ['id'],
    }],
    where: {},
    limit: Number(req.query.limit) || 10,
    order: [['created_at', 'desc']],
  };

  if (req.query.sort) {
    const [field, order] = req.query.sort.split(' ');
    if (field && order) {
      options.order = [[field, order]];
    }
  }

  if (req.query.group_id) options.where.group_id = req.query.group_id;

  const { q, email, locker_code: lockerCode } = req.query;
  if (lockerCode) options.where.locker_code = lockerCode.trim();
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
  const options = {
    attributes: [
      'id', 'salutation', 'first_name', 'last_name', 'email', 'alternate_email',
      'phone_code', 'phone', 'secondary_phone_code', 'secondary_phone',
    ],
    limit: Number(req.query.limit) || 20,
  };

  return User
    .findById(req.user.id, options)
    .then(user => res.json(user))
    .catch(next);
};

exports.states = (req, res, next) => {
  const groupId = Number(req.user.group_id);
  State
    .findAll({
      attributes: ['id', 'name', 'parent_id', 'config'],
      include: [
        {
          model: State,
          as: 'Childs',
          attributes: [['id', 'state_id']],
          required: false,
        },
        {
          model: ActionableState,
          as: 'Actions',
          where: { group_id: groupId },
          attributes: [['child_id', 'state_id']],
          required: false,
        },
        { // for Hire: 2, Partner: 5, Others: 5(internal)
          model: GroupState,
          where: { group_id: [2, 5, 15].includes(groupId) ? groupId : 4 },
          attributes: ['name', 'description'],
          required: false,
        },
      ],
      order: [['id', 'ASC'], [{ model: ActionableState, as: 'Actions' }, 'id', 'ASC']],
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
  const user = req.body;
  const lockerCode = 'SHPR'.concat(parseInt(Math.random() * 100, 10)).concat(parseInt((Math.random() * (1000 - 100)) + 100, 10));
  user.locker_code = lockerCode;
  const saved = await User.create(user);
  return res.json(saved);
};

exports.show = (req, res, next) => {
  const { id } = req.params;
  log('show', id);
  return User
    .findById(Number(id), {
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
        required: false,
      }, {
        model: Order,
        attributes: ['id'],
        required: false,
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

exports.presignedUrl = (req, res, next) => {
  const { filename } = req.query;
  const now = new Date();
  const object = `${now.getFullYear()}/${now.getMonth()}/${uuidv4()}.${filename.split('.').pop()}`;
  return Minio
    .uploadLink({
      object,
      bucket: MINIO_BUCKET,
    })
    .then(url => res.json({ object, url }))
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
