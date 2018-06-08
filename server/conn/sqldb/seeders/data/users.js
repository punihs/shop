
module.exports = (constants) => {
  const {
    GROUPS: {
      OPS, MEMBER, MARKETING, MANAGEMENT,
    },
    COUNTRIES: {
      IND,
    },
  } = constants;

  return [
    {
      id: 1,
      salutation: 'Mr',
      first_name: 'Saneel',
      last_name: 'E S',
      email: 'saneel@gmail.com',
      phone_code: '91',
      phone: '7891378913',
      password: '$2y$10$4Yg4RRg.HLMIpvd2L5nQO.vaRT.cW9NlsfXwi5alT1nKCa7dIs1R6',
      group_id: OPS,
    },
    {
      id: 2,
      salutation: 'Mr',
      first_name: 'Venkat',
      last_name: 'Customer',
      email: 'venkat@gmail.com',
      phone_code: '91',
      phone: '9844717202',
      password: '$2y$10$4Yg4RRg.HLMIpvd2L5nQO.vaRT.cW9NlsfXwi5alT1nKCa7dIs1R6',
      group_id: MEMBER,
    },
    {
      id: 354,
      salutation: 'Mrs',
      first_name: 'Nikkitha',
      last_name: 'Shanker',
      email: 'nikkitha@shoppre.com',
      phone_code: '91',
      phone: '9844717202',
      password: '$2y$10$4Yg4RRg.HLMIpvd2L5nQO.vaRT.cW9NlsfXwi5alT1nKCa7dIs1R6',
      group_id: MANAGEMENT,
    }, {
      id: 398,
      salutation: 'Ms',
      first_name: 'Vismaya',
      last_name: 'R K',
      email: 'vismaya@shoppre.com',
      phone_code: '91',
      phone: '8921113192',
      password: '$2y$10$4Yg4RRg.HLMIpvd2L5nQO.vaRT.cW9NlsfXwi5alT1nKCa7dIs1R6',
      group_id: MANAGEMENT,
    },
    {
      id: 2940,
      salutation: 'Mr',
      first_name: 'Shoppre',
      last_name: 'Marketing',
      email: 'marketing@shoppre.com',
      phone_code: '91',
      phone: '9844717202',
      password: '$2y$10$4Yg4RRg.HLMIpvd2L5nQO.vaRT.cW9NlsfXwi5alT1nKCa7dIs1R6',
      group_id: MEMBER,
    },
    {
      id: 2177,
      salutation: 'Mr',
      first_name: 'Dhananjaya',
      last_name: 'Shekhar',
      email: 'dj@shoppre.com',
      phone_code: '91',
      phone: '9060122213',
      password: '$2y$10$4Yg4RRg.HLMIpvd2L5nQO.vaRT.cW9NlsfXwi5alT1nKCa7dIs1R6',
      group_id: MARKETING,
    },
    {
      id: 647,
      salutation: 'Mr',
      first_name: 'Abhinav',
      last_name: 'Mishra',
      email: 'abhinav@shoppre.com',
      phone_code: '91',
      phone: '9060122213',
      password: '$2y$10$4Yg4RRg.HLMIpvd2L5nQO.vaRT.cW9NlsfXwi5alT1nKCa7dIs1R6',
      group_id: MEMBER,
    },
    {
      id: 2757,
      salutation: 'Mrs',
      first_name: 'Shilpa',
      last_name: 'Kaimal',
      email: 'shilpa.humcap@gmail.com',
      phone_code: '91',
      phone: '9060122213',
      password: '$2y$10$4Yg4RRg.HLMIpvd2L5nQO.vaRT.cW9NlsfXwi5alT1nKCa7dIs1R6',
      group_id: MEMBER,
    }, {
      id: 129,
      salutation: 'Mr',
      first_name: 'Varun',
      last_name: 'Murali',
      email: 'varun.murali@gmail.com',
      phone_code: '91',
      phone: '585410510',
      password: '$2y$10$4Yg4RRg.HLMIpvd2L5nQO.vaRT.cW9NlsfXwi5alT1nKCa7dIs1R6',
      group_id: MEMBER,
    },
    {
      id: 101,
      salutation: 'Mr',
      first_name: 'Shoppre Agent',
      last_name: 'Bot',
      email: 'bot@shoppre.com',
      phone_code: '91',
      phone: '9844717202',
      password: '$2y$10$4Yg4RRg.HLMIpvd2L5nQO.vaRT.cW9NlsfXwi5alT1nKCa7dIs1R6', // admin1234
      group_id: 1,
      country_id: 224,
      created_at: '2016-10-17 19:02:23',
    }, {
      id: 102,
      salutation: 'Mrs',
      first_name: 'Nikkitha',
      last_name: 'Shanker',
      email: 'nikkitha@shoppre.com',
      phone_code: '91',
      phone: '9148359143',
      password: '$2y$10$4Yg4RRg.HLMIpvd2L5nQO.vaRT.cW9NlsfXwi5alT1nKCa7dIs1R6', // admin1234
      group_id: 1,
      referred_by: 101,
      created_at: '2016-10-17 19:02:23',
    }, {
      id: 103,
      salutation: 'Ms',
      first_name: 'Saira',
      last_name: 'Hassan',
      email: 'saira@shoppre.com',
      phone_code: '971',
      phone: '501401199',
      password: '$2y$10$4Yg4RRg.HLMIpvd2L5nQO.vaRT.cW9NlsfXwi5alT1nKCa7dIs1R6', // admin1234
      group_id: 1,
      referred_by: 102,
      created_at: '2016-10-17 19:02:23',
    }, {
      id: 104,
      salutation: 'Mrs',
      first_name: 'Swetha',
      last_name: 'Kalkar',
      email: 'swetha@shoppre.com',
      phone_code: '91',
      phone: '7891378913',
      password: '$2y$10$4Yg4RRg.HLMIpvd2L5nQO.vaRT.cW9NlsfXwi5alT1nKCa7dIs1R6', // admin1234
      group_id: 1,
      referred_by: 102,
      created_at: '2017-10-17 19:02:23',
    }, {
      id: 105,
      salutation: 'Mrs',
      first_name: 'Snehalatha',
      last_name: '',
      email: 'snehalatha@shoppre.com',
      phone_code: '91',
      phone: '9535802244',
      password: '$2y$10$4Yg4RRg.HLMIpvd2L5nQO.vaRT.cW9NlsfXwi5alT1nKCa7dIs1R6', // admin1234
      group_id: 1,
      referred_by: 104,
    }, {
      id: 106,
      salutation: 'Ms',
      first_name: 'Meena',
      last_name: 'Sannapa',
      email: 'meena@shoppre.com',
      phone_code: '91',
      phone: '9071032646',
      password: '$2y$10$4Yg4RRg.HLMIpvd2L5nQO.vaRT.cW9NlsfXwi5alT1nKCa7dIs1R6', // admin1234
      group_id: 1,
      referred_by: 104,
    }, {
      id: 107,
      salutation: 'Ms',
      first_name: 'Prasanna',
      last_name: '',
      email: 'prasanna@shoppre.com',
      phone_code: '91',
      phone: '8977298985',
      password: '$2y$10$4Yg4RRg.HLMIpvd2L5nQO.vaRT.cW9NlsfXwi5alT1nKCa7dIs1R6', // admin1234
      group_id: 1,
      referred_by: 105,
    }, {
      id: 108,
      salutation: 'Ms',
      first_name: 'Vismaya',
      last_name: 'R K',
      email: 'vismaya.rk@shoppre.com',
      phone_code: '91',
      phone: '7676323620',
      password: '$2y$10$4Yg4RRg.HLMIpvd2L5nQO.vaRT.cW9NlsfXwi5alT1nKCa7dIs1R6', // admin1234
      group_id: 1,
      referred_by: 104,
    }, {
      id: 109, // marketing
      salutation: 'Ms',
      first_name: 'Manlee',
      last_name: 'Chowdhary',
      email: 'manlee@shoppre.com',
      phone_code: '91',
      phone: '7891378913',
      password: '$2y$10$4Yg4RRg.HLMIpvd2L5nQO.vaRT.cW9NlsfXwi5alT1nKCa7dIs1R6', // admin1234
      group_id: 1,
      referred_by: 104,
    }, { // consolidation, Quick Package Entry, Updating Package full details, photo, items
      id: 110,
      salutation: 'Mr',
      first_name: 'Mahesh',
      last_name: 'Krishnamurthy',
      email: 'maheshabvp@icloud.com',
      phone_code: '91',
      phone: '9900759900',
      country_id: 224,
      password: '$2y$10$4Yg4RRg.HLMIpvd2L5nQO.vaRT.cW9NlsfXwi5alT1nKCa7dIs1R6', // admin1234
      group_id: 1,
      referred_by: 102,
    }, { // consolidation, Quick Package Entry, Updating Package full details, photo, items
      id: 111,
      salutation: 'Mr',
      first_name: 'Saneel',
      last_name: 'E S',
      email: 'saneel.es@shoppre.com',
      phone_code: '91',
      phone: '7891378913',
      password: '$2y$10$4Yg4RRg.HLMIpvd2L5nQO.vaRT.cW9NlsfXwi5alT1nKCa7dIs1R6', // admin1234
      group_id: 1,
      referred_by: 102,
    }, { //  Updating Package full details, photo, items
      id: 112,
      salutation: 'Mr',
      first_name: 'Lakshmi',
      last_name: 'Narayana',
      email: 'lakshmi.narayana@shoppre.com',
      phone_code: '91',
      phone: '7891378913',
      password: '$2y$10$4Yg4RRg.HLMIpvd2L5nQO.vaRT.cW9NlsfXwi5alT1nKCa7dIs1R6', // admin1234
      group_id: 1,
      referred_by: 102,
    }, { // Storage, 50 locker availablity seeding
      id: 113,
      salutation: 'Mr',
      first_name: 'Darshan',
      last_name: 'V',
      email: 'darshn.v@shoppre.com',
      phone_code: '91',
      phone: '7891378913',
      password: '$2y$10$4Yg4RRg.HLMIpvd2L5nQO.vaRT.cW9NlsfXwi5alT1nKCa7dIs1R6', // admin1234
      group_id: 1,
    }, { // on ship Request Packaging, seeding box inventory
      id: 114,
      salutation: 'Mr',
      first_name: 'Swarop',
      last_name: 'Sathya',
      email: 'swaroop.m@shoppre.com',
      phone_code: '91',
      phone: '7891378913',
      password: '$2y$10$4Yg4RRg.HLMIpvd2L5nQO.vaRT.cW9NlsfXwi5alT1nKCa7dIs1R6', // admin1234
      group_id: 1,
    }, { // Payment Approval
      id: 115,
      salutation: 'Mr',
      first_name: 'Manjunath',
      last_name: '',
      email: 'manjunath.k@shoppre.com',
      phone_code: '91',
      phone: '7891378913',
      password: '$2y$10$4Yg4RRg.HLMIpvd2L5nQO.vaRT.cW9NlsfXwi5alT1nKCa7dIs1R6', // admin1234
      group_id: 1,
    }, { // -SALES
      id: 116,
      salutation: 'Mrs',
      first_name: 'Tanuja',
      last_name: 'P',
      email: 'tanuja.p@shoppre.com',
      phone_code: '91',
      phone: '9844717202',
      password: '$2y$10$4Yg4RRg.HLMIpvd2L5nQO.vaRT.cW9NlsfXwi5alT1nKCa7dIs1R6',
      group_id: 2,
    },
  ].map(x => ({ locker_code: 'SHPR-112', country_id: IND, ...x }));
};
