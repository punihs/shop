const { links } = require('./../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('links', links, {});
  },

  down(queryInterface) {
    return queryInterface.bulkDelete('links', { id: links.map(x => x.id) });
  },
};
