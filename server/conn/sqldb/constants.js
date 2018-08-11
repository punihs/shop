const r = require;
const debug = require('debug');
const _ = require('lodash');

const log = debug('s.conn.sqldb.constants');

const keyValueMap = (name, arr, key, value) => {
  log('keyValueMap', { name, key, value });
  return arr
    .reduce((nxt, x) => ({
      ...nxt,
      [x[key].replace(' ', '_').toUpperCase()]: x[value],
    }), {});
};

// default key is `name`
const map = {
  user: 'first_name',
  country: 'iso3',
};

const constants = {};

[
  { name: 'country' },
  { name: 'group' },
  { name: 'user' },
  { name: 'org' },
  { name: 'product' },
  { name: 'org_product', keyMap: false },
  { name: 'object_type' },
  { name: 'app', keyMap: false },
  { name: 'package_item_category' },
  { name: 'payment_gateway', keyMap: false },
  { name: 'shipping_partner', keyMap: false },
  { name: 'store', keyMap: false },
  { name: 'keyword', keyMap: false },
  { name: 'seo', keyMap: false },
  { name: 'shipment', keyMap: false },
  { name: 'shipment_issue', keyMap: false },
  { name: 'faqCategory', keyMap: false },
  { name: 'faq', keyMap: false },
  { name: 'place', keyMap: false },
  { name: 'review', keyMap: false },
  { name: 'link', keyMap: false },
  { name: 'estimation', keyMap: false },
  { name: 'category', keyMap: false },
  { name: 'link', keyMap: false },
  { name: 'source', keyMap: false },
  { name: 'state', keyMap: false },
  { name: 'actionable_state', keyMap: false },
  { name: 'loyalty_point', keyMap: false },
  { name: 'redemption', keyMap: false },
  { name: 'coupon', keyMap: false },
  { name: 'locker', keyMap: false },
  { name: 'refer_code', keyMap: false },
  { name: 'shipment_meta', keyMap: false },
  { name: 'shipment_state', keyMap: false },
  { name: 'shipment_type', keyMap: false },
  { name: 'country_guide', keyMap: false },
  { name: 'shipping_rate', keyMap: false },
  { name: 'shipment_mail', keyMap: false },
  { name: 'store_category', keyMap: false },
  { name: 'store_category_club', keyMap: false },
  { name: 'schedule_pickup', keyMap: false },
]
  .forEach(({ name, keyMap = true }) => {
    const data = r(`./../../api/${_.camelCase(name)}/${_.camelCase(name)}.seed`)(constants);
    // - used for dependency injection
    constants[_.camelCase(name)] = data;
    // - for writing contant names instead of number like instead of 1 for group_id we write OPS
    if (keyMap !== false) constants[name.toUpperCase()] = keyValueMap(name, data, map[name] || 'name', 'id');
  });

module.exports = constants;
