const debug = require('debug');

const {
  Auth,
} = require('../../conn/sqldb');
const service = require('./auth.service');

const log = debug('s.user.controller');

exports.me = (req, res, next) => {
  log('me');
  return Auth
    .findById(req.user.id, {
      attributes: [
        'id', 'salutation', 'first_name', 'last_name', 'email',
        'phone', 'profile_photo_url',
      ],
      limit: Number(req.query.limit) || 20,
    })
    .then(user => res.json(user))
    .catch(next);
};

exports.show = (req, res, next) => {
  const { id } = req.params;
  log('show', id);

  return Auth
    .findById(Number(id), {
      attributes: req.query.fl
        ? req.query.fl.split(',')
        : [
          'id', 'name', 'first_name', 'last_name', 'salutation', 'phone', 'email',
        ],
    })
    .then((user) => {
      res.json(user.toJSON());
    })
    .catch(next);
};

exports.unread = async (req, res) => {
  const { id } = req.params;
  const status = await Auth.update({ admin_read: 'no' }, { where: { id } });
  return res.json(status);
};

exports.update = (req, res, next) => {
  const id = req.params.id || req.user.id;
  return Auth
    .update(req.body, { where: { id } })
    .then(({ id: Id }) => res.json({ id: Id }))
    .catch(next);
};

exports.destroy = async (req, res) => {
  const { id } = req.params;
  const status = await Auth.destroy({
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
    await Auth.find(options)
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
  await Auth
    .findById(req.params.id, { attributes: ['id'] })
    .then((customer) => {
      customer.update({ password: req.body.password })
        .catch(next);
    });

  return res.json({ message: 'Your account password has been changed. Please login to continue.' });
};
