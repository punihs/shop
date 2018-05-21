const getTemplate = require('../../getTemplate');
const path = require('path');

const scriptName = path.basename(__filename);

const TemplateName = scriptName.slice(0, -3);
const layoutName = __dirname.split('/').pop();
const afterContent = ['afterContent'];

module.exports = {
  TemplateData: {
    reference: '20',
    seller: 'FB seller',
    date: '19/5/2018',
    weight: '5',
  },
  Template: {
    TemplateName,
    SubjectPart: 'Some of your Packages(s) is incurring a Storage Fee | Package(s)',
    HtmlPart: getTemplate({
      layoutName,
      TemplateName,
      afterContent,
    }),
  },
};
