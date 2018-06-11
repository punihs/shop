const { org } = require('../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('orgs', org, {});
  },

  down(queryInterface) {
    return queryInterface.bulkDelete('orgs', { id: org.map(x => x.id) });
  },
};
