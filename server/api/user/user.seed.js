
module.exports = (constants) => {
  const {
    GROUP: {
      OPS, MEMBER,
    },
    COUNTRY: {
      IND,
    },
  } = constants;

  return [
    {
      id: 1,
      salutation: 'Mr',
      first_name: 'Saneel',
      last_name: 'E S',
      email: 'support@shoppre.com',
      phone_code: '91',
      phone: '7891378913',
      password: '$2y$10$4Yg4RRg.HLMIpvd2L5nQO.vaRT.cW9NlsfXwi5alT1nKCa7dIs1R6',
      group_id: OPS,
    },
    {
      id: 646,
      salutation: 'Mr',
      first_name: 'Abhinav',
      last_name: 'Mishra',
      email: 'tech.shoppre@gmail.com',
      phone_code: '91',
      phone: '9060122213',
      password: '$2y$10$4Yg4RRg.HLMIpvd2L5nQO.vaRT.cW9NlsfXwi5alT1nKCa7dIs1R6',
      group_id: MEMBER,
      virtual_address_code: 'SHPR82-162',
    },
  ].map(x => ({

    country_id: IND,
    ...x,
    profile_photo_url: 'https://lh3.googleusercontent.com/-UYCUQAneuQo/AAAAAAAAAAI/AAAAAAAAAAo/tGVHInxDmiY/photo.jpg?sz=50',
  }));
};