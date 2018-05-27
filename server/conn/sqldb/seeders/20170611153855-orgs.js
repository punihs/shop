const { orgs } = require('../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('orgs', orgs, {});
  },

  down(queryInterface) {
    return queryInterface.bulkDelete('orgs', { id: orgs.map(x => x.id) });
  },
};
