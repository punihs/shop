const crypto = require('crypto');
const debug = require('debug');

const log = debug('s.passwordReset.controller');
const {
  PasswordReset, User,
} = require('../../conn/sqldb');

exports.submitForgot = async (req, res) => {
  log(process.env.APP_KEY);
  const options = {
    attributes: ['id', 'email'],
    where: { email: req.body.email },
  };
  log('email', req.body.email);
  const customer = await User
    .find(options);
  if (!customer) {
    return res.json({ message: 'Sorry, Email address submitted not found' });
  }
  customer.token = await this.createPasswordReset(customer.email);
  log('reset token', customer.token);

  // Mail::to($customer->email)->send(new ResetPassword($customer));  // sending mail is pending
  return res.json({ message: 'Password reset link send to your email address.' });
};

exports.createPasswordReset = async (email) => {
  const reset = {};
  const token = await this.encrypt();
  reset.email = email;
  reset.token = token;
  await PasswordReset.create(reset);
  return token;
};

exports.encrypt = () => {
  const hmac = crypto.createHmac('sha256', process.env.APP_KEY);
  const signed = hmac.update(Buffer.from(process.env.APP_KEY, 'utf-8')).digest('base64');
  return signed;
};

exports.update = async (req, res, next) => { // resetPassword
  if (req.body.password !== req.body.password_confirmation) {
    return res.json({ message: 'Password and confirm did not match' });
  }
  log('email', req.body.email);
  await PasswordReset
    .destroy({ where: { email: req.body.email } });

  const options = {
    attributes: ['id', 'email'],
    where: { email: req.body.email },
  };

  await User.find(options)
    .then((customer) => {
      customer.update({ password: req.body.password })
        .catch(next);
    });

  return res.json({ message: 'Your account password has been changed. Please login to continue.' });
};
