
const getTemplate = require('../../getTemplate');
const path = require('path');

const scriptName = path.basename(__filename);

const TemplateName = scriptName.slice(0, -3);
const layoutName = __dirname.split('/').pop();
const afterContent = ['afterContent'];

module.exports = {
  TemplateData: {
    day: 'May 30th',
    org: {
      name: 'Shoppre',
    },
  },
  Template: {
    TemplateName,
    SubjectPart: '{{org.name}} Daily Summary for {{day}}',
    HtmlPart: getTemplate({
      layoutName,
      TemplateName,
      afterContent,
    }),
  },
};
