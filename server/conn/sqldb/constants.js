const r = require;
const _ = require('lodash');

const keyValueMap = (arr, key, value) => arr
  .reduce((nxt, x) => Object
    .assign(nxt, {
      [x[key].toUpperCase()]: x[value],
    }), {});

// default key is `name`
const map = {
  users: 'first_name',
  countries: 'iso3',
};

const constants = {};

[
  { name: 'groups' },
  { name: 'users' },
  { name: 'orgs' },
  { name: 'products' },
  { name: 'org_products', keyMap: false },
  { name: 'object_types', keyMap: false },
  { name: 'apps', keyMap: false },
  { name: 'countries', keyMap: false },
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
  { name: 'partner_links', keyMap: false },
]
  .forEach(({ name: x, keyMap = true }) => {
    const data = r(`./seeders/data/${_.camelCase(x)}`)(constants);
    // - used for dependency injection
    constants[_.camelCase(x)] = data;
    // - for writing contant names instead of number like instead of 1 for group_id we write OPS
    if (keyMap !== false) constants[x.toUpperCase()] = keyValueMap(data, map[x] || 'name', 'id');
  });

module.exports = constants;
