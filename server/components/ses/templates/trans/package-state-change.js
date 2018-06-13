
const getTemplate = require('../../getTemplate');
const path = require('path');

const scriptName = path.basename(__filename);

const TemplateName = scriptName.slice(0, -3);
const layoutName = __dirname.split('/').pop();
const afterContent = ['afterContent'];

module.exports = {
  TemplateData: {
    pkg: {
      Store: {
        name: 'Amazon',
      },
    },
    customer: {
      first_name: 'Abhinav',
    },
  },
  Template: {
    TemplateName,
    SubjectPart: 'Your package from {{pkg.Store.name}} just arrived',
    HtmlPart: getTemplate({
      layoutName,
      TemplateName,
      afterContent,
    }),
  },
};
