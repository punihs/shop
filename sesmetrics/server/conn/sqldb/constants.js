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
  { name: 'project' },
]
  .forEach(({ name, keyMap = true }) => {
    const data = r(`./../../api/${_.camelCase(name)}/${_.camelCase(name)}.seed`)(constants);
    // - used for dependency injection
    constants[_.camelCase(name)] = data;
    // - for writing contant names instead of number like instead of 1 for group_id we write OPS
    if (keyMap !== false) constants[name.toUpperCase()] = keyValueMap(name, data, map[name] || 'name', 'id');
  });

module.exports = constants;
