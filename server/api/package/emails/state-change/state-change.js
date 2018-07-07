
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
    pkg: {
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
    }],
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
