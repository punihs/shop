const { project } = require('../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('projects', project, {});
  },

  down(queryInterface) {
    return queryInterface.destroy('projects', { truncate: true, cascade: false });
  },
};
