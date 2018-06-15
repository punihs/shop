
const getTemplate = require('../../getTemplate');
const viewConfig = require('../../config');

const TemplateName = __dirname.split('/').slice(-2).join('_');
const afterContent = ['partials:cheers'];

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
