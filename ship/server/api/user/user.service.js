const { User } = require('../../conn/sqldb');
const { GSUITE_DOMAIN } = require('../../config/environment');
const { GROUPS: { OPS, CUSTOMER }, ROLES: { RECEPTION } } = require('../../config/constants');
const hookshot = require('./user.hookshot');
const { generateVirtualAddressCode } = require('../../components/util');
const { encrypt } = require('../../components/crypto');

const checkDuplicate = email => User.find({
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
    virtual_address_code: virtualAddressCode,
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

      const IS_OPS = GSUITE_DOMAIN === email.trim().split('@')[1];

      // - Saving Customer Details
      return encrypt(email)
        .then(token => User
          .create({
            id,
            salutation,
            first_name: firstName,
            last_name: lastName,
            password,
            email,
            phone,
            virtual_address_code: virtualAddressCode || generateVirtualAddressCode(),
            group_id: IS_OPS ? OPS : CUSTOMER,
            email_token: token,
            role_id: IS_OPS ? RECEPTION : null,
          }, { hooks })
          .then((customer) => {
            // - Sending Verification Email via Hook
            hookshot.signup(customer);

            return { code: 201, customer };
          }));
    });
};
