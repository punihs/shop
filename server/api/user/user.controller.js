const _ = require('lodash');
const debug = require('debug');

const crypto = require('crypto');

const {
  User, State, ActionableState, GroupState, Shipment, Country, Package, Order, ShippingPreference,
  ReferCode, LoyaltyPoint, LoyaltyHistory, Locker,
} = require('../../conn/sqldb');

const log = debug('s.user.controller');
const {
  LOYALTY_TYPE: {
    CREDIT,
  },
  STATE_TYPES,
} = require('../../config/constants');

exports.index = (req, res, next) => {
  const options = {
    attributes: [
      'id', 'name', 'email', 'mobile', 'salutation', 'first_name', 'last_name', 'phone',
      'phone_code', 'country_id', 'referred_by', 'created_at', 'virtual_address_code',
      'profile_photo_url',
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
  const options = {
    attributes: [
      'id', 'salutation', 'first_name', 'last_name', 'email', 'alternate_email', 'group_id',
      'phone_code', 'phone', 'secondary_phone_code', 'secondary_phone', 'profile_photo_url',
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
      // res.json([null, ...out.filter(x => x)]);
    })
    .catch(next);
};

exports.create = async (req, res) => {
  const user = req.body;
  const lockerCode = this.lockerGenerate();
  user.virtual_address_code = lockerCode;
  const saved = await User.create(user);
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
          'mobile', 'email', 'phone', 'phone_code',
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

exports.submitRegister = async (req, res) => {
  let loyalPoints = 0;
  const customerId = req.user.id;
  log('customer id', customerId);
  if (req.body.refferal) {
    const options = {
      attributes: ['id', 'customer_id'],
      where: { friend: req.body.email, code: req.body.refferal },
    };
    const refer = await ReferCode
      .find(options);
    if (refer) {
      const optionLoyalty = {
        attributes: ['id', 'total_points'],
        where: { customer_id: customerId },
      };
      loyalPoints = 200;
      const loyaltyUpdate = {};

      await LoyaltyPoint
        .find(optionLoyalty)
        .then((loyaltyPoint) => {
          loyaltyUpdate.points = loyaltyPoint.points + loyalPoints;
          loyaltyUpdate.total_points = loyaltyPoint.total_points + loyalPoints;

          if (loyaltyPoint.total_points < 1000) {
            loyaltyUpdate.level = 1;
          } else if (loyaltyPoint.total_points >= 1000 &&
            loyaltyPoint.total_points < 6000) {
            loyaltyUpdate.level = 2;
          } else if (loyaltyPoint.total_points >= 6000 &&
            loyaltyPoint.total_points < 26000) {
            loyaltyUpdate.level = 3;
          } else if (loyaltyPoint.total_points >= 26000) {
            loyaltyUpdate.level = 4;
          }
          loyaltyPoint.update(loyaltyUpdate);
        });

      // const friend = LoyaltyPoint
      //   .find(optionLoyalty);
      log(loyalPoints);

      const referFriend = await User
        .findById(refer.customer_id, {
          attributes: ['id', 'email', 'first_name', 'last_name'],
        });
      log(refer.customer_id);

      const loyaltyHistory = {};
      loyaltyHistory.customer_id = refer.customer_id;
      loyaltyHistory.points = loyalPoints;
      loyaltyHistory.redeemed = new Date();
      loyaltyHistory.type = CREDIT;
      loyaltyHistory.description = 'Your friend signed up with the referral code that you sent';
      await LoyaltyHistory.create(loyaltyHistory);

      log(referFriend);
      // Mail::to($referFriend->email)->send(new ReferEarned('Congratulations! You have
      // earned 200 Shoppre Loyalty Points simply because your friend signed up with the referral
      // code that you sent!'));

      // Mail::to($request->email)->send(new ReferEarned('Congratulations! You have earned
      // 200 Shoppre Loyalty Points simply because you signed up with the referral code that your
      // friend sent!'));
    } else {
      res.json({ message: 'You may entered an invalid refferal code. Try with another or proceed without.' });
    }
  }

  const customer = {};

  if (req.body.referrer) {
    customer.referred_customer_id = Buffer.from(req.body.referrer).toString('base64');
    const optionUser = {
      attributes: ['name', 'email'],
      where: { id: customer.referred_customer_id },
    };
    const referrer = await User
      .find(optionUser);
    //   Mail::to($referrer->email)
    // ->send(new ReferralSuccess(['referrer' => $referrer, 'customer' => $customer]));
    log(referrer);
  }

  let name = '';
  if (req.body.title) {
    name += `${req.body.title}  '. '`;
  }
  name += `${req.body.firstname}  ' ' ${req.body.lastname}`;

  customer.name = name;
  customer.email = req.body.email;
  customer.password = req.body.password;
  if (req.body.referrer) {
    customer.referred_customer_id = Buffer.from(req.body.referrer).toString('base64');

    const optionUser = {
      attributes: ['name', 'email'],
      where: { id: Buffer.from(req.body.referrer).toString('base64') },
    };

    const referrer = await User
      .find(optionUser);
    //  Mail::to($referrer->email)
    // ->send(new ReferralSuccess(['referrer' => $referrer, 'customer' => $customer]));
    log(referrer);
  }
  // let userCode = '';           // Required
  // const option = {
  //   attributes: ['id'],
  //   where: { locker: code },
  // };
  const code = this.lockerGenerate();
  //
  // do {
  //   code = this.lockerGenerate();           // Required
  //   userCode = await User
  //     .find(option);
  // } while (!userCode);

  customer.locker = code;
  log(customer);
  const newCustomer = await User
    .create(customer);

  const loyaltyPoint = {};
  loyaltyPoint.customer_id = newCustomer.id;
  loyaltyPoint.level = 1;
  loyaltyPoint.points = loyalPoints;
  loyaltyPoint.total_points = loyalPoints;
  await LoyaltyPoint.create(loyaltyPoint);

  const loyaltyHistory = {};
  loyaltyHistory.customer_id = newCustomer.id;
  loyaltyHistory.points = loyalPoints;
  loyaltyHistory.redeemed = new Date();
  loyaltyHistory.type = CREDIT;
  loyaltyHistory.description = 'Signed up with the referral code that your friend sent';
  await LoyaltyHistory.create(loyaltyHistory);

  const shippingPreference = {};
  shippingPreference.customer_id = newCustomer.id;
  await ShippingPreference.create(shippingPreference);

  await this.sendEmailVerification(req.body.email);

  return res.json({
    message: `You need to confirm your account.
    We have sent you an activation code, please check your email.`,
  });
};

exports.lockerGenerate = () => {
  const code = 'SHPR'.concat(parseInt(Math.random() * 100, 10)).concat(parseInt((Math.random() * (1000 - 100)) + 100, 10));
  return code;
};

exports.sendEmailVerification = async (email) => {
  this.generateToken(email);
  const customer = await User
    .find({ where: { email } });
  // Mail::to($customer->email)->send(new EmailVerification($customer));
  log(customer);
};

exports.generateToken = async (email) => {
  const token = await this.encrypt();
  log('token', token);
  await User.update({ email_token: token }, { where: { email } });
  return token;
};

exports.encrypt = async () => {
  const hmac = crypto.createHmac('sha256', process.env.APP_KEY);
  const signed = hmac.update(Buffer.from(process.env.APP_KEY, 'utf-8')).digest('base64');
  return signed;
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

