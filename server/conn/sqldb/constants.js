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
  { name: 'package_item_category' },
  { name: 'store', keyMap: false },
  { name: 'state', keyMap: false },
  { name: 'personal-shopper-state', keyMap: false },
  { name: 'actionable_state', keyMap: false },
  { name: 'personal-shopper-actionable-state', keyMap: false },
  { name: 'shipment-actionable-state', keyMap: false },
  { name: 'cod-actionable-state', keyMap: false },
  { name: 'cod-state', keyMap: false },
  { name: 'locker', keyMap: false },
  { name: 'after-ship-carriers', keyMap: false },
  { name: 'package-inactive-state', keyMap: false },
  { name: 'shipment-inactive-state', keyMap: false },
  { name: 'package-inactive-actionable-state', keyMap: false },
  { name: 'shipment-inactive-actionable-state', keyMap: false },
]
  .forEach(({ name, keyMap = true }) => {
    const data = r(`./../../api/${_.camelCase(name)}/${_.camelCase(name)}.seed`)(constants);
    // - used for dependency injection
    constants[_.camelCase(name)] = data;
    // - for writing contant names instead of number like instead of 1 for group_id we write OPS
    if (keyMap !== false) constants[name.toUpperCase()] = keyValueMap(name, data, map[name] || 'name', 'id');
  });

[
  { name: 'package-discard-actionable-state', keyMap: false },
  { name: 'package-ready-to-discard-actionable-state', keyMap: false },
  { name: 'personal-shopper-failed-actionable-state', keyMap: false },
  { name: 'carriers_afterShip', keyMap: false },
  { name: 'carrier_afterShip', keyMap: false },
  { name: 'package_discard_to_ready_actionable_state', keyMap: false },
  { name: 'shipment_inactive_to_shipment_abandon', keyMap: false },
  { name: 'shipment_failed_to_shipment_confirm', keyMap: false },
]
  .forEach(({ name, keyMap = true }) => {
    const data = r(`./../../api/seedingFiles/${_.camelCase(name)}.seed`)(constants);
    // - used for dependency injection
    constants[_.camelCase(name)] = data;
    // - for writing contant names instead of number like instead of 1 for group_id we write OPS
    if (keyMap !== false) constants[name.toUpperCase()] = keyValueMap(name, data, map[name] || 'name', 'id');
  });

module.exports = constants;
