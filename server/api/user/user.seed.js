
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
      phone: '7891378913',
      group_id: OPS,
    },
    {
      id: 646,
      salutation: 'Mr',
      first_name: 'Abhinav',
      last_name: 'Mishra',
      email: 'tech.shoppre@gmail.com',
      phone: '9060122213',
      group_id: MEMBER,
      virtual_address_code: 'SHPR82-162',
    },
  ].map(x => ({

    country_id: IND,
    ...x,
    profile_photo_url: 'https://lh3.googleusercontent.com/-UYCUQAneuQo/AAAAAAAAAAI/AAAAAAAAAAo/tGVHInxDmiY/photo.jpg?sz=50',
  }));
};
