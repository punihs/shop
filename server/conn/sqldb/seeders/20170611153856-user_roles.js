module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('user_roles', [{
      id: 1,
      user_id: 1, // saneel internal
      role_id: 2, // Reception
    }, {
      id: 3,
      user_id: 1, // saneel internal
      role_id: 3, // Package Verifier
    }], {});
  },

  down(queryInterface) {
    return queryInterface.bulkDelete('user_roles', { id: [1, 2] });
  },
};
