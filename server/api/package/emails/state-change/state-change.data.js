const viewConfig = require('../../../../emails/config');

const packageItems = [{
  id: 9,
  name: 'Hello Box',
  quantity: 2,
  price_amount: 2,
  total_amount: 4,
  object: 'https://staging-cdn.shoppre.com/shoppre/2018/6/8a854b15-7cc5-4553-b8ae-a6fd49fe89ee.png',
  package_item_category_id: 18,
  PackageItemCategory: {
    name: 'Good Category',
  },
  package_id: '10',
  created_by: 1,
}];

const OPS = {
  first_name: 'Saneel',
  last_name: 'E S',
};

const pkg = {
  id: 1,
  reference_code: 'AMZ123',
  Store: {
    name: 'Amazon',
  },
};

const customer = {
  name: 'Mr. Abhinav Mishra',
  first_name: 'Abhinav',
  virtual_address_code: 'SHPR12-182',
};

const ENV = viewConfig;

module.exports = {
  CREATED: {
    pkg,
    customer,
    actingUser: OPS,
    ENV,
  },
  INFORMATION_UPLOADED: {
    pkg,
    customer,
    actingUser: OPS,
    ENV,
    packageItems,
  },
  PAYMENT_RECEIVED: [],
};
