
const getTemplate = require('../../getTemplate');
const path = require('path');

const scriptName = path.basename(__filename);

const TemplateName = scriptName.slice(0, -3);
const layoutName = __dirname.split('/').pop();
const afterContent = ['afterContent'];

module.exports = {
  TemplateData: {
    first_name: 'Manjesh V',
    points: 50,
    reason: 'Nothing',
  },
  Template: {
    TemplateName,
    SubjectPart: 'Thanks For Being A Loyal Shippr',
    HtmlPart: getTemplate({
      layoutName,
      TemplateName,
      afterContent,
    }),
  },
};
