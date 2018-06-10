const r = require;
const debug = require('debug');
const _ = require('lodash');

const log = debug('s.conn.sqldb.constants');

const keyValueMap = (arr, key, value) => {
  log('keyValueMap', { key, value });
  return arr
    .reduce((nxt, x) => ({
      ...nxt,
      [x[key].replace(' ', '_').toUpperCase()]: x[value],
    }), {});
};

// default key is `name`
const map = {
  users: 'first_name',
  countries: 'iso3',
};

const constants = {};

[
  { name: 'countries' },
  { name: 'groups' },
  { name: 'users' },
  { name: 'orgs' },
  { name: 'products' },
  { name: 'org_products', keyMap: false },
  { name: 'object_types' },
  { name: 'apps', keyMap: false },
  // { name: 'cities', keyMap: false },
  { name: 'package_item_categories' },
  { name: 'payment_gateways', keyMap: false },
  { name: 'shipping_partners', keyMap: false },
  { name: 'stores', keyMap: false },
  { name: 'keywords', keyMap: false },
  { name: 'seo', keyMap: false },
  { name: 'shipments', keyMap: false },
  { name: 'shipment_issues', keyMap: false },
  { name: 'faqCategories', keyMap: false },
  { name: 'faq', keyMap: false },
  { name: 'places', keyMap: false },
  { name: 'reviews', keyMap: false },
  { name: 'links', keyMap: false },
  { name: 'estimations', keyMap: false },
  { name: 'categories', keyMap: false },
  { name: 'links', keyMap: false },
  { name: 'sources', keyMap: false },
  { name: 'states', keyMap: false },
  { name: 'actionable_states', keyMap: false },
  { name: 'loyaltyPoints', keyMap: false },
  { name: 'redemptions', keyMap: false },
  { name: 'coupons', keyMap: false },
]
  .forEach(({ name, keyMap = true }) => {
    const data = r(`./seeders/data/${_.camelCase(name)}`)(constants);
    // - used for dependency injection
    constants[_.camelCase(name)] = data;
    // - for writing contant names instead of number like instead of 1 for group_id we write OPS
    if (keyMap !== false) constants[name.toUpperCase()] = keyValueMap(data, map[name] || 'name', 'id');
  });

module.exports = constants;
