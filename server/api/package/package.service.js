

const {
  Package, Store,
} = require('../../conn/sqldb');

const { PACKAGE_STATES, APPS, GROUPS: { CUSTOMER, OPS } } = require('./../../config/constants');

exports.index = ({ query, user }) => {
  const { status } = query;
  const options = {
    where: {},
    offset: Number(query.offset) || 0,
    limit: Number(query.limit) || 20,
  };

  switch (true) {
    case (user.app_id === APPS.WWW): {
      options.attributes = ['id', 'price_amount', 'number_of_items', 'store_id'];
      options.where = {
        is_public: true,
      };
      options.include = [{
        model: Store,
        attributes: ['id', 'name'],
      }];

      break;
    }
    case (user.app_id === APPS.MEMBER && user.group_id === CUSTOMER): {
      options.attributes = ['id', 'received_at'];
      options.where.customer_id = user.id;
      break;
    }
    case (user.app_id === APPS.OPS && user.group_id === OPS): {
      options.attributes = ['id', 'customer_id', 'received_at'];
      options.where.customer_id = user.id;
      break;
    }
    default:
      return Promise.reject();
  }

  const states = Object.values(PACKAGE_STATES);

  if (states.includes(status)) options.where.status = status;

  return Package
    .findAll(options);
};
