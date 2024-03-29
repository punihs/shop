const debug = require('debug');
const moment = require('moment');
const sequelize = require('sequelize');
const _ = require('lodash');
const {
  SUPPORT_EMAIL_ID, SUPPORT_EMAIL_FIRST_NAME, SUPPORT_EMAIL_LAST_NAME,
} = require('../../config/environment');
const transactionCtrl = require('../transaction/transaction.controller');

const {
  APPS, GROUPS: { CUSTOMER, OPS },
  PACKAGE_STATE_IDS: {
    PACKAGE_ITEMS_UPLOAD_PENDING, SPLIT_PACKAGE_PROCESSED, AWAITING_VERIFICATION, IN_REVIEW,
    ADDED_SHIPMENT, AWAITING_FOR_ORDER, ORDER_CREATED, RETURN_PICKUP_DONE,
  },
  PACKAGE_TYPES: {
    PERSONAL_SHOPPER, COD,
  },

  PAYMENT_GATEWAY: {
    WIRE, CASH, CARD, PAYTM, PAYPAL, WALLET, RAZOR,
  },
  PAYMENT_GATEWAY_NAMES,
  PACKAGE_STATE_IDS: PKG_STATE_IDS,
} = require('./../../config/constants');
const {
  PACKAGE: {
    SPLIT_PACKAGE,
  },
} = require('../../config/constants/charges');
const BUCKETS = require('./../../config/constants/buckets');
const { PACKAGE_STORAGE_NUMBER_OF_DAYS } = require('./../../config/constants/options');

let BUCKET = '';
const logger = require('../../components/logger');

const {
  Package, Store, User, Locker, PackageState, PackageItem, PhotoRequest,
  State, PackageCharge,
} = require('../../conn/sqldb');

const hookshot = require('./package.hookshot');

// const stateIdcommentMap = {
//   [PACKAGE_ITEMS_UPLOAD_PENDING]: 'Package Recieved',
//   [SPLIT_PACKAGE_PROCESSED]: 'Package Splitted!', // email sending is pending
// };

const log = debug('s-api-package-service');

const kvmap = (arr, key, value) => arr.reduce((nxt, x) => ({ ...nxt, [x[key]]: x[value] }), {});

exports.index = async ({
  query, params, user: actingUser, next,
}) => {
  try {
    // - Locker Page or Member Dashboard
    const IS_CUSTOMER_PAGE = !!params.customerId;
    const { type } = query;
    const { shopperType } = query;
    const packageType = shopperType === 'cod' ? COD : PERSONAL_SHOPPER;
    console.log({ type });

    if (type === 'ORDER') {
      BUCKET = BUCKETS.ORDER[actingUser.group_id];
      console.log({ BUCKET });
    } else {
      BUCKET = BUCKETS.PACKAGE[actingUser.group_id];
    }

    const { bucket } = query;
    console.log({ bucket });
    let orderSort = '';
    if (query.sort) {
      const [field, order] = query.sort.split(' ');

      if (field && order) {
        orderSort = [[field, order]];
      } else {
        orderSort = [['id', 'desc']];
      }
    } else {
      orderSort = [['id', 'desc']];
    }

    const options = {
      where: {},
      order: orderSort,
      offset: Number(query.offset) || 0,
      limit: Number(query.limit) || 20,
    };

    switch (true) {
      case (actingUser.app_id === APPS.MEMBER && actingUser.group_id === CUSTOMER): {
        options.attributes = ['id', 'created_at', 'weight', 'price_amount', 'order_code',
          'store_id', 'content_type', 'invoice_code', 'notes', 'is_restricted_item'];
        options.where.customer_id = actingUser.id;
        options.include = [{
          where: {},
          model: PackageState,
          attributes: ['id', 'state_id'],
          include: [{
            model: State,
            attributes: ['id', 'name'],
          }],
        }, {
          model: PackageItem,
          attributes: ['id', 'name', 'price_amount',
            'quantity', 'total_amount', 'object', 'object_advanced'],
        }, {
          model: Store,
          attributes: ['id', 'name'],
        }, {
          model: PhotoRequest,
          attributes: ['id', 'status', 'type'],
          // where: { status: COMPLETED },
        }];
        break;
      }
      case (actingUser.app_id === APPS.OPS && actingUser.group_id === OPS): {
        if (IS_CUSTOMER_PAGE) options.where.customer_id = params.customerId;
        if (type === 'ORDER') options.where.package_type = packageType;

        options.attributes = ['id', 'customer_id', 'created_at', 'weight', 'price_amount', 'store_id', 'invoice_code',
          'content_type', 'updated_at', 'order_code', 'transaction_id', 'package_type', 'is_restricted_item'];
        options.include = [{
          where: {},
          model: PackageState,
          attributes: ['id', 'state_id'],
        }, {
          model: PackageItem,
          attributes: ['id', 'name', 'price_amount',
            'quantity', 'total_amount', 'object', 'object_advanced'],
        }, {
          model: Store,
          attributes: ['id', 'name'],
        }];

        if (!IS_CUSTOMER_PAGE) {
          options.include.push({
            model: User,
            as: 'Customer',
            attributes: ['id', 'name', 'virtual_address_code', 'first_name', 'last_name', 'salutation', 'profile_photo_url'],
            include: [{
              model: Locker,
              attributes: ['id', 'short_name', 'name'],
            }],
          });
        }
        break;
      }
      default:
        options.attributes = ['id', 'customer_id', 'created_at', 'weight', 'price_amount'];
    }

    const states = Object.keys(BUCKET);

    // - filters
    if (query.sid) {
      options.include[0].where.state_id = query.sid.split(',');
    } else if (states.includes(bucket) && options.include && options.include.length) {
      // - uploaded person can't do verification
      if (bucket === 'TASKS' && type !== 'ORDER') {
        options.include[0].where = {
          $or: {
            state_id: BUCKET[bucket].filter(x => (x !== AWAITING_VERIFICATION)),
            $and: {
              state_id: AWAITING_VERIFICATION,
              $not: { user_id: actingUser.id },
            },
          },
        };
      } else if (bucket === 'FEEDBACK' && type !== 'ORDER') {
        options.include[0].where = {
          $or: {
            state_id: BUCKET[bucket].filter(x => (x !== AWAITING_VERIFICATION)),
            $and: {
              state_id: AWAITING_VERIFICATION,
              user_id: actingUser.id,
            },
          },
        };
      } else {
        options.include[0].where.state_id = BUCKET[bucket];
      }
    }

    const [packages, total, facets, newfacets] = await Promise
      .all([
        Package
          .findAll(options),
        Package
          .count({ where: options.where, include: options.include }),
        await PackageState
          .findAll({
            attributes: [[sequelize.fn('count', 1), 'cnt'], 'state_id'],
            where: { state_id: BUCKET[bucket] },
            include: [{
              where: options.where,
              model: Package,
              attributes: [],
            }],
            group: ['state_id'],
            raw: true,
          }),
        Package
          .findAll({
            attributes: ['id', 'package_state_id'],
            where: {
              customer_id: actingUser.id,
            },
          })
          .then(pkgs => PackageState
            .findAll({
              attributes: [[sequelize.fn('count', 1), 'cnt'], 'state_id'],
              where: {
                id: pkgs.map(x => x.package_state_id),
              },
              group: ['state_id'],
              raw: true,
            }))
          .then((packageStateGroups) => {
            // converting array to map for speedup
            const stateIdCountMap = kvmap(packageStateGroups, 'state_id', 'cnt');

            // grouping based on buckets
            const facetsMap = Object
              .keys(BUCKET)
              .reduce((nxt, buck) => {
                const aggregate = BUCKET[buck]
                  .reduce((nxty, stateId) => (nxty + (stateIdCountMap[stateId] || 0)), 0);

                return { ...nxt, [buck]: aggregate };
              }, {});

            return facetsMap;
          }),

      ]);

    return ({
      packages: packages
        .map(x => (x.PackageState ? ({ ...x.toJSON(), state_id: x.PackageState.state_id }) : x)),
      total,
      facets: newfacets,
      oldfacets: {
        state_id: kvmap(facets, 'state_id', 'cnt'),
      },
    });
  } catch (err) {
    return next(err);
  }
};
exports.updateState = async ({
  lastStateId,
  nextStateId,
  pkg,
  actingUser,
  comments = null,
  next,
}) => {
  try {
    const options = {
      package_id: pkg.id,
      user_id: actingUser.id,
      state_id: nextStateId,
    };

    log('Package State', options);

    // if (stateIdcommentMap[nextStateId]) options.comments = stateIdcommentMap[nextStateId];

    if (comments) {
      options.comments = comments;
    } else {
      // const comment =  Object.keys(PKG_STATE_IDS)[nextStateId];
      options.comments = _.startCase(((_.invert(PKG_STATE_IDS))[nextStateId]).toLowerCase());
    }

    const packageState = await PackageState
      .create(options);

    switch (nextStateId) {
      case SPLIT_PACKAGE_PROCESSED: {
        await PackageCharge
          .update(
            { split_package_amount: SPLIT_PACKAGE },
            { where: { id: pkg.id } },
          );
        break;
      }
      case PACKAGE_ITEMS_UPLOAD_PENDING: {
        await Locker
          .allocation({ customerId: pkg.customer_id });
        await Package.update(
          { package_received_date: moment() },
          { where: { id: pkg.id } },
        );
        break;
      }
      case RETURN_PICKUP_DONE: {
        let today = moment();
        if (pkg.package_received_date) {
          const receivedDate = moment(pkg.package_received_date, 'DD-MM-YYYY');
          today = moment(today, 'DD-MM-YYYY');
          const noOfDays = today.diff(receivedDate, 'days');

          let returnCharges = 0;

          if (noOfDays >= 4 && noOfDays <= 10) {
            returnCharges = 100;
          } else if (noOfDays >= 11 && noOfDays <= 15) {
            returnCharges = 200;
          } else if (noOfDays > 15) {
            returnCharges = 400;
          }

          if (returnCharges > 0) {
            await transactionCtrl
              .setWallet({
                customer_id: pkg.customer_id,
                amount: -returnCharges,
                description: `Package return charges for package Id ${pkg.id} and number of days is ${noOfDays}`,
              });
          }
        }
        break;
      }
      default: {
        log('state changed default');
      }
    }

    const IS_CUSTOMER = actingUser.group_id === CUSTOMER;
    let opsUser = null;

    if (IS_CUSTOMER) {
      opsUser = {
        first_name: SUPPORT_EMAIL_FIRST_NAME,
        last_name: SUPPORT_EMAIL_LAST_NAME,
        email: SUPPORT_EMAIL_ID,
      };
    } else {
      opsUser = actingUser;
    }

    let gateway = null;
    if (pkg.transaction_id) {
      const {
        payment_gateway_id: paymentGatewayID,
      } = await this.transaction(pkg);

      switch (Number(paymentGatewayID)) {
        case CASH: {
          gateway = PAYMENT_GATEWAY_NAMES.CASH; break;
        }
        case CARD: {
          gateway = PAYMENT_GATEWAY_NAMES.CARD; break;
        }
        case WIRE: {
          gateway = PAYMENT_GATEWAY_NAMES.WIRE; break;
        }
        case PAYPAL: {
          gateway = PAYMENT_GATEWAY_NAMES.PAYPAL; break;
        }
        case PAYTM: {
          gateway = PAYMENT_GATEWAY_NAMES.PAYTM; break;
        }
        case WALLET: {
          gateway = PAYMENT_GATEWAY_NAMES.WALLET; break;
        }
        case RAZOR: {
          gateway = PAYMENT_GATEWAY_NAMES.RAZOR; break;
        }
        default: {
          gateway = null; break;
        }
      }
    }

    const paymentGateway = {
      name: gateway,
    };

    if (!([IN_REVIEW, AWAITING_VERIFICATION, ADDED_SHIPMENT,
      AWAITING_FOR_ORDER, ORDER_CREATED].includes(nextStateId))) {
      hookshot
        .stateChange({
          nextStateId,
          lastStateId,
          pkg,
          comments: options.comments,
          actingUser: opsUser,
          next,
          paymentGateway,
          packageItems: pkg.PackageItems,
        })
        .catch(err => logger.error('statechange notification', nextStateId, pkg, err));
    }

    const pckg = await Package
      .update({
        package_state_id: packageState.id,
      }, {
        where: { id: pkg.id },
      });

    return pckg;
  } catch (err) {
    return next(err);
  }
};

exports.updatePackageOptions = async (body) => {
  body.forEach((item) => {
    const subTotal = item.delivery_charge + item.sales_tax +
      item.personal_shopper_cost + item.price_amount;
    Object.assign(item, { sub_total: subTotal });
    Package
      .update(item, { where: { id: item.id } });
  });

  return 'success';
};

exports.packageStorageExceededEmail = async () => {
  const today = moment();
  const expiredDate = moment(today, 'DD-MM-YYYY').add('days', (-PACKAGE_STORAGE_NUMBER_OF_DAYS));
  const pkg = await Package.findAll({
    where: { package_received_date: { $lt: expiredDate } },
    attributes: ['id', 'customer_id', 'package_received_date'],
    include: [{
      model: PackageState,
      attributes: ['id'],
      where: { state_id: [1, 2, 3, 4, 5, 6] },
    }],
  });

  return pkg;
};

exports.packageStorageEmail = async () => {
  const today = moment();
  const expiringDate1 = moment(today, 'DD-MM-YYYY').add('days', (-15));
  const expiringDate2 = moment(today, 'DD-MM-YYYY').add('days', (-19));
  const pkg = await Package.findAll({
    where: {
      $and: [
        { package_received_date: { $lte: expiringDate1 } },
        { package_received_date: { $gte: expiringDate2 } },
      ],
    },
    attributes: ['id', 'customer_id', 'package_received_date'],
    include: [{
      model: PackageState,
      attributes: ['id'],
      where: { state_id: [1, 2, 3, 4, 5, 6] },
    }],
  });

  return pkg;
};
