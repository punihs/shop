
const { GROUPS: { CUSTOMER } } = require('../../../../config/constants');
const viewConfig = require('../../../../emails/config');
const getTemplate = require('../../../../conn/email/ses/render');

const TemplateName = __dirname.split('/')
  .slice(-3)
  .filter(x => (x !== 'emails'))
  .join('_');

const afterContent = ['global:cheers'];

module.exports = {
  TemplateData: {
    shpmnt: {
      id: 1,
      reference_code: 'AMZ123',
      Store: {
        name: 'Amazon',
      },
    },
    customer: {
      name: 'Mr. Abhinav Mishra',
      first_name: 'Abhinav',
      virtual_address_code: 'SHPR12-182',
    },
    actingUser: {
      first_name: 'Saneel',
      last_name: 'E S',
    },
    ENV: viewConfig,
    packageItems: [{
      id: 9,
      name: 'Hello Box',
      store: 'Amazon.com',
      weight: '5kg',
      quantity: 2,
      order_code: 'shp-09123',
      price_amount: 2,
      date_recieved_at: '10-02-2018',
      total_amount: 4,
      package_item_category_id: 18,
      PackageItemCategory: {
        name: 'Good Category',
      },
      package_id: '10',
      created_by: 1,
    }, {
      id: 10,
      name: 'Hello Box',
      store: 'flipkart.com',
      weight: '1kg',
      quantity: 4,
      order_code: 'shp-09123',
      price_amount: 4,
      date_recieved_at: '10-02-2018',
      total_amount: 16,
      package_item_category_id: 18,
      PackageItemCategory: {
        name: 'Good Category',
      },
      package_id: '10',
      created_by: 2,
    }],
    ship_to_address: {
      line1: '314 Euphoria Circle',
      line2: '314 Euphoria Circle',
      city: 'Cary, NC',
      state: 'florida',
      country: 'United states',
      pincode: '560008',
      phone: '8970972343',
    },
  },
  Meta: {
    group_id: CUSTOMER,
    description: 'Invitation to view CV',
  },
  Template: {
    TemplateName,
    SubjectPart: 'Your {{pkg.Store.name}} order #{{pkg.reference_code}} is received',
    HtmlPart: getTemplate({
      TemplateName,
      afterContent,
    }),
  },
};
