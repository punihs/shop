
module.exports = (constants) => {
  const {
    GROUPS: {
      OPS, MARKETING, CUSTOMER, MANAGEMENT,
    },
  } = constants;

  return [
    {
      id: 1,
      salutation: 'Mr',
      first_name: 'Saneel',
      last_name: 'E S',
      email: 'saneel@gmail.com',
      phone: '917891378913',
      password: '$2y$10$4Yg4RRg.HLMIpvd2L5nQO.vaRT.cW9NlsfXwi5alT1nKCa7dIs1R6',
      group_id: OPS,
    },
    {
      id: 2,
      salutation: 'Mr',
      first_name: 'Venkat',
      last_name: 'Customer',
      email: 'venkat@gmail.com',
      phone: '919844717202',
      password: '$2y$10$4Yg4RRg.HLMIpvd2L5nQO.vaRT.cW9NlsfXwi5alT1nKCa7dIs1R6',
      group_id: CUSTOMER,
    },
    {
      id: 354,
      salutation: 'Mrs',
      first_name: 'Nikkitha',
      last_name: 'Shanker',
      email: 'nikkitha@shoppre.com',
      phone: '919844717202',
      password: '$2y$10$4Yg4RRg.HLMIpvd2L5nQO.vaRT.cW9NlsfXwi5alT1nKCa7dIs1R6',
      group_id: MANAGEMENT,
    }, {
      id: 398,
      salutation: 'Ms',
      first_name: 'Vismaya',
      last_name: 'R K',
      email: 'vismaya@shoppre.com',
      phone: '918921113192',
      password: '$2y$10$4Yg4RRg.HLMIpvd2L5nQO.vaRT.cW9NlsfXwi5alT1nKCa7dIs1R6',
      group_id: MANAGEMENT,
    },
    {
      id: 2940,
      salutation: 'Mr',
      first_name: 'Shoppre',
      last_name: 'Marketing',
      email: 'marketing@shoppre.com',
      phone: '919844717202',
      password: '$2y$10$4Yg4RRg.HLMIpvd2L5nQO.vaRT.cW9NlsfXwi5alT1nKCa7dIs1R6',
      group_id: CUSTOMER,
    },
    {
      id: 2177,
      salutation: 'Mr',
      first_name: 'Dhananjaya',
      last_name: 'Shekhar',
      email: 'dj@shoppre.com',
      phone: '919060122213',
      password: '$2y$10$4Yg4RRg.HLMIpvd2L5nQO.vaRT.cW9NlsfXwi5alT1nKCa7dIs1R6',
      group_id: MARKETING,
    },
  ];
};
