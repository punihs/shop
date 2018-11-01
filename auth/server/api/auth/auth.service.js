const { Auth } = require('../../conn/sqldb');
const hookshot = require('./auth.hookshot');

const checkDuplicate = email => Auth.find({
  attributes: ['id'],
  where: { email },
  raw: true,
});

exports.signup = async ({ body }) => {
  const {
    id,
    salutation,
    first_name: firstName,
    last_name: lastName,
    email: e,
    phone,
    password,
    hooks,
  } = body;

  const email = e.trim();
  // - Todo: Email Validation
  return checkDuplicate(email)
    .then((found) => {
      if (found) {
        return {
          code: 409,
          id: found.id,
          message: 'Duplicate',
        };
      }

      // - Saving Customer Details
      return Auth
        .create({
          id,
          salutation,
          first_name: firstName,
          last_name: lastName,
          password,
          email,
          phone,
        }, { hooks })
        .then((customer) => {
          // - Sending Verification Email via Hook
          hookshot.signup(customer);

          return { code: 201, customer };
        });
    });
};
