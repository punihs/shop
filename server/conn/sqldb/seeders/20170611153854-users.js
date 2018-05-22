module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('users', [{
      id: 1,
      name: 'Saneel E S',
      email: 'saneel@gmail.com',
      phone: '917891378913',
      password: '$2y$10$4Yg4RRg.HLMIpvd2L5nQO.vaRT.cW9NlsfXwi5alT1nKCa7dIs1R6', // admin1234
      group_id: 1,
    }, {
      id: 2,
      name: 'Venkat',
      email: 'venkat@gmail.com',
      phone: '919844717202',
      password: '$2y$10$4Yg4RRg.HLMIpvd2L5nQO.vaRT.cW9NlsfXwi5alT1nKCa7dIs1R6',
      group_id: 2,
    }], {});
  },

  down(queryInterface) {
    return queryInterface.bulkDelete('users', { id: [1, 2] });
  },
};
